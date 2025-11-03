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
  getUserCount,
  getUserSummary,
} = require("../controllers/userController");

// POST /api/users/save-card
router.get("/albums", fetchUserAlbums);
router.post("/save-card", saveOrReplaceCard);
router.get("/:uid/card", getUserCardByTrack);
router.get("/:uid/card-with-track", getUserCardWithTrack);
router.post("/add-exp", addExp);
router.post("/add-card", addCard);
router.post("/google-login", googleLogin);
router.get("/count", getUserCount);
router.get("/:uid/summary", getUserSummary);

module.exports = router;
