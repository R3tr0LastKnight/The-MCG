const express = require("express");
const router = express.Router();

const {
  getUserCardByTrack,
  getUserCardWithTrack,
  saveOrReplaceCard,
  fetchUserAlbums,
  addExp,
  addCard,
  googleLogin,
} = require("../controllers/userController");

// POST /api/users/save-card
router.post("/save-card", saveOrReplaceCard);
router.get("/:uid/card", getUserCardByTrack);
router.get("/:uid/card-with-track", getUserCardWithTrack);
router.get("/albums/fetch-user", fetchUserAlbums);
router.post("/add-exp", addExp);
router.post("/add-card", addCard);
router.post("/google-login", googleLogin);

module.exports = router;
