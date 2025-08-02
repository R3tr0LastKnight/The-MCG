const fetch = require("node-fetch");
const { getAccessToken } = require("../utils/spotifyAuth");

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
