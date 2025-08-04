const SpotifyToken = require("../models/tokenModel");
const fetch = require("node-fetch");

async function getValidSpotifyAccessToken() {
  const tokenDoc = await SpotifyToken.findOne();

  if (!tokenDoc) throw new Error("Spotify token not found");

  if (tokenDoc.expiresAt > new Date()) {
    return tokenDoc.accessToken; // still valid
  }

  // Refresh it
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
      refresh_token: tokenDoc.refreshToken,
    }),
  };

  const tokenRes = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) throw new Error("Failed to refresh token");

  const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  tokenDoc.accessToken = tokenData.access_token;
  tokenDoc.expiresAt = newExpiresAt;
  await tokenDoc.save();

  return tokenData.access_token;
}

module.exports = { getValidSpotifyAccessToken };
