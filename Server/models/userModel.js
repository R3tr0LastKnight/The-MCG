// models/User.js
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    trackId: { type: String, required: true },
    albumId: { type: String, required: true },
    border: { type: Number, required: true },
    bgSubId: { type: Number, required: true },
    effectId: { type: Number, required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    cards: [cardSchema],
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
