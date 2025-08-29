const express = require("express");
const router = express.Router();
const { googleLogin } = require("../controllers/userController");
const { addCard } = require("../controllers/userController");

router.post("/add-card", addCard);
router.post("/google-login", googleLogin);

module.exports = router;
