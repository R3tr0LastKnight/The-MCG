const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
require("./database/db");

dotenv.config();

const allowedOrigins = ["https://the-mcg.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
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

// ✅ Export the app (for Vercel function)
module.exports = app;

// Only run listen() if not in Vercel environment
if (process.env.NODE_ENV !== "vercel") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
