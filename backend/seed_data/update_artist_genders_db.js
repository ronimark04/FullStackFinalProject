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

        // Filter artists with bornElsewhere data and gender
        const artistsWithGender = artistsFromJson.filter(artist =>
            artist.bornElsewhere &&
            (artist.bornElsewhere.eng || artist.bornElsewhere.heb) &&
            artist.gender
        );

        // Create a map of artist names to their gender from JSON
        const artistGenderMap = new Map(
            artistsWithGender.map(artist => [
                artist.name.eng || artist.name.heb,
                artist.gender
            ])
        );

        // Get all artists from database
        const dbArtists = await Artist.find({});
        let updatedCount = 0;
        let skippedCount = 0;

        console.log(`Found ${dbArtists.length} artists in database`);
        console.log(`Found ${artistsWithGender.length} artists with gender data in JSON file`);

        // Update each artist's gender if they have bornElsewhere data
        for (const dbArtist of dbArtists) {
            const artistName = dbArtist.name.eng || dbArtist.name.heb;
            const jsonGender = artistGenderMap.get(artistName);
            const dbGender = dbArtist.gender;

            // Only process artists that have bornElsewhere data
            if (dbArtist.bornElsewhere && (dbArtist.bornElsewhere.eng || dbArtist.bornElsewhere.heb)) {
                console.log(`\nChecking artist: ${artistName}`);
                console.log(`DB gender: ${dbGender || 'not set'}`);
                console.log(`JSON gender: ${jsonGender || 'not found'}`);

                if (jsonGender && dbGender !== jsonGender) {
                    console.log(`Genders differ - updating...`);
                    await Artist.updateOne(
                        { _id: dbArtist._id },
                        { $set: { gender: jsonGender } }
                    );
                    updatedCount++;
                    console.log(`Updated gender for artist: ${artistName} to ${jsonGender}`);
                } else if (jsonGender && dbGender === jsonGender) {
                    console.log(`Genders match - skipping`);
                    skippedCount++;
                } else if (!jsonGender) {
                    console.log(`No gender data in JSON - skipping`);
                    skippedCount++;
                }
            }
        }

        console.log(`\n✅ Update completed!`);
        console.log(`- Artists updated with gender: ${updatedCount}`);
        console.log(`- Artists skipped (already correct or no data): ${skippedCount}`);
        console.log(`- Total artists processed: ${updatedCount + skippedCount}`);

        // Show summary of gender distribution in database
        const maleCount = await Artist.countDocuments({ gender: 'm' });
        const femaleCount = await Artist.countDocuments({ gender: 'f' });
        const totalArtists = await Artist.countDocuments({});

        console.log(`\nDatabase gender distribution:`);
        console.log(`- Male artists: ${maleCount}`);
        console.log(`- Female artists: ${femaleCount}`);
        console.log(`- Artists without gender: ${totalArtists - maleCount - femaleCount}`);
        console.log(`- Total artists in database: ${totalArtists}`);

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