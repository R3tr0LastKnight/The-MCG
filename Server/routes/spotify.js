const express = require("express");
const router = express.Router();
const { getAlbumByName } = require("../controllers/spotifyController");
const { fetchAndEnrichAllAlbums } = require("../controllers/spotifyController");

router.get("/album", getAlbumByName);
router.get("/albums/fetch-all", fetchAndEnrichAllAlbums);

module.exports = router;
