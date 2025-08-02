const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
require("./database/db");

dotenv.config();
app.use(cors());
app.use(express.json());

// Route
const spotifyRoutes = require("./routes/spotify");
app.use("/api/spotify", spotifyRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to The MCG backend");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
