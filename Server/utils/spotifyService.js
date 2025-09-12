const axios = require("axios");
const { getValidSpotifyAccessToken } = require("../utils/spotifyAuth");

async function fetchTrackFromSpotify(trackId) {
  const accessToken = await getValidSpotifyAccessToken(); // ✅ moved inside
  const url = `https://api.spotify.com/v1/tracks/${trackId}`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

module.exports = { getValidSpotifyAccessToken, fetchTrackFromSpotify };
