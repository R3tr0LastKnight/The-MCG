const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("connected", () => console.log("MongoDB connected"));
db.on("error", (err) => console.error("MongoDB connection error:", err));

module.exports = db;
