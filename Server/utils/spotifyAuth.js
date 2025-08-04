// utils/spotifyAuth.js

const SpotifyToken = require("../models/spotifyToken");
const fetch = require("node-fetch");

async function getValidSpotifyAccessToken() {
  const tokenDoc = await SpotifyToken.findOne();

  if (!tokenDoc) throw new Error("Spotify token not found");

  const now = Date.now();
  if (now < tokenDoc.expires_at) {
    return tokenDoc.access_token;
  }

  // Token expired, refresh it
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
      grant_type: "refresh_token",
      refresh_token: tokenDoc.refresh_token,
    }),
  };

  const tokenRes = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) throw new Error("Failed to refresh Spotify token");

  const newExpiresAt = Date.now() + tokenData.expires_in * 1000;

  tokenDoc.access_token = tokenData.access_token;
  tokenDoc.expires_at = newExpiresAt;
  await tokenDoc.save();

  return tokenData.access_token;
}

module.exports = {
  getValidSpotifyAccessToken,
};
