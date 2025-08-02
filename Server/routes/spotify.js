const express = require("express");
const router = express.Router();
const { getAlbumByName } = require("../controllers/spotifyController");

router.get("/album", getAlbumByName);

module.exports = router;
