const User = require("../models/userModel");

// Google Login Controller
exports.googleLogin = async (req, res) => {
  const { uid, name, email, photo } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      // New user → create and save
      user = new User({ uid, name, email, photo });
      await user.save();
      console.log(" New user created:", user.email);
    } else {
      console.log(" User already exists:", user.email);
    }

    // Always return user
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error in googleLogin:", err);
    res.status(500).json({ error: err.message });
  }
};

// Save card data for a user
exports.addCard = async (req, res) => {
  try {
    const { uid, cardData } = req.body;

    if (!uid || !cardData) {
      return res.status(400).json({ message: "uid and cardData are required" });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push new card
    user.cards.push(cardData);
    await user.save();

    res
      .status(200)
      .json({ message: "Card added successfully", cards: user.cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
