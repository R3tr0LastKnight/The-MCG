const SpotifyToken = require("../models/tokenModel");
const axios = require("axios");

async function getValidSpotifyAccessToken() {
  const tokenDoc = await SpotifyToken.findOne();

  if (!tokenDoc) {
    throw new Error("Spotify token not found");
  }

  if (Date.now() < tokenDoc.expires_at) {
    return tokenDoc.access_token;
  }

  // Token expired → refresh
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenDoc.refresh_token,
    }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const newToken = res.data.access_token;
  const expires_in = res.data.expires_in;

  tokenDoc.access_token = newToken;
  tokenDoc.expires_at = Date.now() + expires_in * 1000;
  await tokenDoc.save();

  return newToken;
}

module.exports = getValidSpotifyAccessToken;
