const fetch = require("node-fetch");
const { getAccessToken } = require("../utils/spotifyAuth");
const ArtistAlbums = require("../models/albumModel");

exports.getAlbumByName = async (req, res) => {
  const { artist, album } = req.query;

  if (!artist || !album) {
    return res.status(400).json({ error: "Missing artist or album" });
  }

  try {
    const token = await getAccessToken();

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
    const token = await getAccessToken();

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
