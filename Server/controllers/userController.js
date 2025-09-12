const User = require("../models/userModel");
const { getValidSpotifyAccessToken } = require("../utils/spotifyAuth");
const { fetchTrackFromSpotify } = require("../utils/spotifyService");

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

exports.addExp = async (req, res) => {
  try {
    const { uid, gainedExp } = req.body;

    if (!uid || !gainedExp) {
      return res.status(400).json({ error: "uid and gainedExp are required" });
    }

    // Find user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add exp
    user.exp += gainedExp;

    // Handle level up logic (every 1000 exp = +1 level)
    while (user.exp >= 1000) {
      user.level += 1;
      user.exp -= 1000; // carry over remaining exp
    }

    await user.save();

    res.status(200).json({
      message: "EXP updated successfully",
      level: user.level,
      exp: user.exp,
    });
  } catch (err) {
    console.error("Error updating EXP:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.fetchUserAlbums = async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "uid required" });

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const accessToken = await getValidSpotifyAccessToken();

    // reverse cards so latest comes first
    const enrichedCards = await Promise.all(
      user.cards
        .slice() // copy
        .reverse()
        .map(async (card) => {
          const trackRes = await fetch(
            `https://api.spotify.com/v1/tracks/${card.trackId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const track = await trackRes.json();

          const albumRes = await fetch(
            `https://api.spotify.com/v1/albums/${card.albumId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const album = await albumRes.json();

          return { ...card.toObject(), track, album };
        })
    );

    res.json(enrichedCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user albums" });
  }
};

exports.getUserCardByTrack = async (req, res) => {
  try {
    const { uid } = req.params;
    const { trackId } = req.query;

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const card = user.cards.find((c) => c.trackId === trackId);
    if (!card) return res.status(404).json({ exists: false });

    res.json({ exists: true, card });
  } catch (err) {
    console.error("Error fetching user card:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserCardWithTrack = async (req, res) => {
  try {
    const { uid } = req.params;
    const { trackId } = req.query;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(200).json({}); // no data if user not found
    }

    const card = user.cards.find((c) => c.trackId === trackId);
    if (!card) {
      return res.status(200).json({}); // no card found
    }

    const track = await fetchTrackFromSpotify(trackId);

    res.json({ card, track });
  } catch (err) {
    console.error("Error fetching user card + track:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserCardWithTrack = async (req, res) => {
  try {
    const { uid } = req.params;
    const { trackId } = req.query;

    const user = await User.findOne({ uid });
    if (!user) return res.status(200).json({ error: "User not found" });

    const card = user.cards.find((c) => c.trackId === trackId);
    if (!card) return res.status(200).json({ exists: false });

    const track = await fetchTrackFromSpotify(trackId);

    res.json({ exists: true, card, track });
  } catch (err) {
    console.error("Error fetching user card + track:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Save or replace a card
exports.saveOrReplaceCard = async (req, res) => {
  try {
    const { uid, newCard, oldCard } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If oldCard is provided, remove it first
    if (oldCard?.trackId) {
      user.cards = user.cards.filter(
        (card) => card.trackId !== oldCard.trackId
      );
    }

    // If newCard is provided, add it
    if (newCard) {
      user.cards.push(newCard);
    }

    await user.save();

    res.json({ success: true, cards: user.cards });
  } catch (err) {
    console.error("Error saving/replacing card:", err);
    res.status(500).json({ error: "Failed to save or replace card" });
  }
};
