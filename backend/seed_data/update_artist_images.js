const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Artist = require("../artists/models/mongodb/Artist");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function connectToDatabase() {
    try {
        const connectionString = process.env.MONGODB_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("MONGODB_CONNECTION_STRING not found in .env file");
        }

        await mongoose.connect(connectionString);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

async function updateArtistImages() {
    try {
        // Connect to database first
        await connectToDatabase();

        // Load artist data from JSON file
        const artistsPath = path.join(__dirname, "artists.json");
        const artistsFromJson = JSON.parse(fs.readFileSync(artistsPath, "utf-8"));

        // Create a map of artist names to their image URLs from JSON
        const artistImageMap = new Map(
            artistsFromJson.map(artist => [
                artist.name.eng || artist.name.heb,
                artist.image?.url
            ])
        );

        // Get all artists from database
        const dbArtists = await Artist.find({});
        let updatedCount = 0;

        console.log(`Found ${dbArtists.length} artists in database`);
        console.log(`Found ${artistsFromJson.length} artists in JSON file`);

        // Update each artist's image URL if it differs from JSON
        for (const dbArtist of dbArtists) {
            const artistName = dbArtist.name.eng || dbArtist.name.heb;
            const jsonImageUrl = artistImageMap.get(artistName);
            const dbImageUrl = dbArtist.image?.url;

            console.log(`\nChecking artist: ${artistName}`);
            console.log(`DB URL: ${dbImageUrl}`);
            console.log(`JSON URL: ${jsonImageUrl}`);

            if (jsonImageUrl && dbImageUrl !== jsonImageUrl) {
                console.log(`URLs differ - updating...`);
                await Artist.updateOne(
                    { _id: dbArtist._id },
                    { $set: { "image.url": jsonImageUrl } }
                );
                updatedCount++;
                console.log(`Updated image URL for artist: ${artistName}`);
            } else {
                console.log(`URLs match or no JSON URL found - skipping`);
            }
        }

        console.log(`\n✅ Updated ${updatedCount} artist image URLs.`);
    } catch (error) {
        console.error("Error updating artist images:", error);
        throw error;
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

// If this script is run directly
if (require.main === module) {
    updateArtistImages()
        .then(() => {
            console.log("Image update completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Image update failed:", error);
            process.exit(1);
        });
}

module.exports = updateArtistImages; 