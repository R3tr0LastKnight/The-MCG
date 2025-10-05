const express = require("express");
const router = express.Router();
const {
  getAlbumByName,
  fetchAndEnrichAllAlbums,
  handleSpotifyCallback,
  getRandomTrackFromAlbum,
  getAllPacks,
} = require("../controllers/spotifyController");

router.get("/all-packs", getAllPacks);
router.get("/random-tracks", getRandomTrackFromAlbum);
router.get("/callback", handleSpotifyCallback);
router.get("/album", getAlbumByName);
router.get("/albums/fetch-all", fetchAndEnrichAllAlbums);

module.exports = router;
