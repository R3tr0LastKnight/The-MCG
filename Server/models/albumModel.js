const mongoose = require("mongoose");

const artistAlbumsSchema = new mongoose.Schema(
  {
    artist: { type: String, required: true },
    albums: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ArtistAlbums", artistAlbumsSchema);
