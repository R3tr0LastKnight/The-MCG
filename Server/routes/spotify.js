const express = require("express");
const router = express.Router();
const { getAlbumByName } = require("../controllers/spotifyController");
const { fetchAndEnrichAllAlbums } = require("../controllers/spotifyController");
const { handleSpotifyCallback } = require("../controllers/spotifyController");
// const {
//   fetchRandomPlaylistTracks,
// } = require("../controllers/spotifyController");

// router.get("/random-tracks", fetchRandomPlaylistTracks);
router.get("/callback", handleSpotifyCallback);
router.get("/album", getAlbumByName);
router.get("/albums/fetch-all", fetchAndEnrichAllAlbums);

module.exports = router;
