require("./database/db"); // Make sure this connects to your DB

const Artist = require("./models/artistModel");
const ArtistAlbums = require("./models/albumModel");

async function seedDatabase() {
  try {
    // Add artist name
    await Artist.create({ name: "Tame Impala" });

    // Add artist + albums
    await ArtistAlbums.create({
      artist: "Tame Impala",
      albums: ["Currents", "Lonerism", "Innerspeaker"],
    });

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Error during seeding:", err.message);
  } finally {
    process.exit(); // Always close the script
  }
}

seedDatabase();
