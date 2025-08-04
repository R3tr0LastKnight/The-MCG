// models/spotifyToken.js
const mongoose = require("mongoose");

const tokenModel = new mongoose.Schema({
  access_token: String,
  refresh_token: String,
  expires_at: Number, // timestamp (Date.now() + expires_in * 1000)
});

module.exports = mongoose.model("SpotifyToken", tokenModel);
