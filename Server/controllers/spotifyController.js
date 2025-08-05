const fetch = require("node-fetch");
const { getValidSpotifyAccessToken } = require("../utils/spotifyAuth");
const SpotifyToken = require("../models/spotifyToken");
const ArtistAlbums = require("../models/albumModel");

exports.getAlbumByName = async (req, res) => {
  const { artist, album } = req.query;

  if (!artist || !album) {
    return res.status(400).json({ error: "Missing artist or album" });
  }

  try {
    const token = await getValidSpotifyAccessToken();

    const query = encodeURIComponent(`album:${album} artist:${artist}`);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`;

    const searchRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await searchRes.json();
    const found = data.albums?.items?.[0];

    if (!found) {
      return res.status(404).json({ error: "Album not found" });
    }

    res.json({
      name: found.name,
      artist: found.artists.map((a) => a.name).join(", "),
      cover: found.images[0]?.url,
      spotifyUrl: found.external_urls.spotify,
    });
  } catch (err) {
    console.error("Error fetching album:", err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
};

exports.fetchAndEnrichAllAlbums = async (req, res) => {
  try {
    const token = await getValidSpotifyAccessToken();

    // Step 1: Fetch all artist/album pairs
    const artistAlbums = await ArtistAlbums.find();
    const allAlbumArtistPairs = [];

    for (const doc of artistAlbums) {
      const artist = doc.artist;
      for (const album of doc.albums) {
        allAlbumArtistPairs.push({ artist, album });
      }
    }

    // Step 2: Shuffle the array
    for (let i = allAlbumArtistPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAlbumArtistPairs[i], allAlbumArtistPairs[j]] = [
        allAlbumArtistPairs[j],
        allAlbumArtistPairs[i],
      ];
    }

    // Step 3: Take the first 10 random pairs
    const random10 = allAlbumArtistPairs.slice(0, 10);

    // Step 4: Enrich from Spotify
    const results = [];

    for (const { artist, album } of random10) {
      const query = encodeURIComponent(`album:${album} artist:${artist}`);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const found = data.albums?.items?.[0];

      if (found) {
        results.push({
          artist,
          album: found.name,
          cover: found.images?.[0]?.url || null,
          spotifyUrl: found.external_urls?.spotify || null,
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching random enriched albums:", err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
};

exports.handleSpotifyCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  const authOptions = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  };

  try {
    const tokenRes = await fetch(
      "https://accounts.spotify.com/api/token",
      authOptions
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) return res.status(500).json({ error: tokenData });

    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    // ⚠️ Clear any old tokens if only one is expected
    await SpotifyToken.deleteMany();

    // ✅ Save new token
    await SpotifyToken.create({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
    });

    res.send("Authorization successful! You can close this window.");
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).send("Callback failed");
  }
};

exports.fetchRandomPlaylistTracks = async (req, res) => {
  try {
    // Get valid access token
    const tokenDoc = await SpotifyToken.findOne();
    if (!tokenDoc || !tokenDoc.accessToken) {
      return res.status(401).json({ error: "Spotify access token missing" });
    }

    const accessToken = tokenDoc.accessToken;

    // Fetch user's playlists
    const playlistsRes = await fetch(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const playlistsData = await playlistsRes.json();
    if (!playlistsRes.ok) {
      console.error("Failed to get playlists:", playlistsData);
      return res.status(500).json({ error: "Failed to fetch playlists" });
    }

    const allTracks = [];

    // Loop through all playlists and collect track previews
    for (const playlist of playlistsData.items) {
      const tracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const tracksData = await tracksRes.json();
      if (tracksRes.ok) {
        for (const item of tracksData.items) {
          const track = item.track;
          if (track?.preview_url) {
            allTracks.push({
              name: track.name,
              artist: track.artists.map((a) => a.name).join(", "),
              preview: track.preview_url,
              cover: track.album.images[0]?.url,
              spotifyUrl: track.external_urls.spotify,
            });
          }
        }
      }
    }

    // Shuffle and return 10 random tracks
    const shuffled = allTracks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    res.json(selected);
  } catch (err) {
    console.error("Error fetching random tracks:", err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
};
