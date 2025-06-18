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

async function updateArtistGenders() {
    try {
        // Connect to database first
        await connectToDatabase();

        // Load artist data from JSON file
        const artistsPath = path.join(__dirname, "artists.json");
        const artistsFromJson = JSON.parse(fs.readFileSync(artistsPath, "utf-8"));

        // Create a map of artist names to their gender from JSON
        const artistGenderMap = new Map(
            artistsFromJson
                .filter(artist => artist.gender) // Only include artists with gender data
                .map(artist => [
                    artist.name.eng || artist.name.heb,
                    artist.gender
                ])
        );

        // Get all artists from database
        const dbArtists = await Artist.find({});
        let updatedCount = 0;
        let skippedCount = 0;

        console.log(`Found ${dbArtists.length} artists in database`);
        console.log(`Found ${artistGenderMap.size} artists with gender data in JSON file`);

        // Update each artist's gender if it differs from JSON
        for (const dbArtist of dbArtists) {
            const artistName = dbArtist.name.eng || dbArtist.name.heb;
            const jsonGender = artistGenderMap.get(artistName);
            const dbGender = dbArtist.gender;

            console.log(`\nChecking artist: ${artistName}`);
            console.log(`DB gender: ${dbGender || 'Not set'}`);
            console.log(`JSON gender: ${jsonGender || 'Not set'}`);

            if (jsonGender && dbGender !== jsonGender) {
                console.log(`Genders differ - updating...`);
                await Artist.updateOne(
                    { _id: dbArtist._id },
                    { $set: { gender: jsonGender } }
                );
                updatedCount++;
                console.log(`Updated gender for artist: ${artistName} to ${jsonGender}`);
            } else if (jsonGender && !dbGender) {
                console.log(`Adding missing gender...`);
                await Artist.updateOne(
                    { _id: dbArtist._id },
                    { $set: { gender: jsonGender } }
                );
                updatedCount++;
                console.log(`Added gender for artist: ${artistName} as ${jsonGender}`);
            } else {
                console.log(`Genders match or no JSON gender found - skipping`);
                skippedCount++;
            }
        }

        console.log(`\n✅ Updated ${updatedCount} artist genders.`);
        console.log(`⏭️  Skipped ${skippedCount} artists.`);
    } catch (error) {
        console.error("Error updating artist genders:", error);
        throw error;
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

// If this script is run directly
if (require.main === module) {
    updateArtistGenders()
        .then(() => {
            console.log("Gender update completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Gender update failed:", error);
            process.exit(1);
        });
}

module.exports = updateArtistGenders; 