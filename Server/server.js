const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
require("./database/db");

dotenv.config();

// ✅ Updated CORS setup to allow specific origin
const allowedOrigins = ["https://the-mcg.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
const spotifyRoutes = require("./routes/spotify");
app.use("/api/spotify", spotifyRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
