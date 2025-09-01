const express = require("express");
const router = express.Router();
const { getAlbumByName } = require("../controllers/spotifyController");
const { fetchAndEnrichAllAlbums } = require("../controllers/spotifyController");
const { handleSpotifyCallback } = require("../controllers/spotifyController");
// const {
//   fetchRandomPlaylistTracks,
// } = require("../controllers/spotifyController");
const { getRandomTrackFromAlbum } = require("../controllers/spotifyController");

router.get("/random-tracks", getRandomTrackFromAlbum);
router.get("/callback", handleSpotifyCallback);
router.get("/album", getAlbumByName);
router.get("/albums/fetch-all", fetchAndEnrichAllAlbums);
// router.get("/random-tracks", fetchRandomPlaylistTracks);

module.exports = router;
