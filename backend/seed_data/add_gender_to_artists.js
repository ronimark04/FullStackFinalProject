const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to get user input
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function addGenderToArtists() {
    try {
        // Load artists data from JSON file
        const artistsPath = path.join(__dirname, "artists.json");
        const artists = JSON.parse(fs.readFileSync(artistsPath, "utf-8"));

        // Find artists with bornElsewhere data
        const artistsWithBornElsewhere = artists.filter(artist =>
            artist.bornElsewhere &&
            (artist.bornElsewhere.eng || artist.bornElsewhere.heb)
        );

        console.log(`Found ${artistsWithBornElsewhere.length} artists with bornElsewhere data.`);
        console.log("Starting gender assignment process...\n");

        let updatedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < artistsWithBornElsewhere.length; i++) {
            const artist = artistsWithBornElsewhere[i];
            const artistName = artist.name.eng || artist.name.heb;
            const bornElsewhere = artist.bornElsewhere.eng || artist.bornElsewhere.heb;

            console.log(`\n--- Artist ${i + 1}/${artistsWithBornElsewhere.length} ---`);
            console.log(`Name: ${artistName}`);
            console.log(`Born Elsewhere: ${bornElsewhere}`);

            if (artist.gender) {
                console.log(`Current gender: ${artist.gender}`);
            } else {
                console.log(`Current gender: Not set`);
            }

            // Ask for gender input
            let gender;
            do {
                gender = await askQuestion("Enter gender (m/f) or 'skip' to skip this artist: ");

                if (gender === 'skip') {
                    console.log("Skipping this artist.");
                    skippedCount++;
                    break;
                }

                if (gender !== 'm' && gender !== 'f') {
                    console.log("Invalid input. Please enter 'm' for male, 'f' for female, or 'skip' to skip.");
                }
            } while (gender !== 'm' && gender !== 'f' && gender !== 'skip');

            if (gender === 'm' || gender === 'f') {
                // Find the artist in the original array and update it
                const artistIndex = artists.findIndex(a => a._id === artist._id ||
                    (a.name.eng === artist.name.eng && a.name.heb === artist.name.heb));

                if (artistIndex !== -1) {
                    artists[artistIndex].gender = gender;
                    updatedCount++;
                    console.log(`✅ Updated gender for ${artistName} to ${gender}`);
                } else {
                    console.log(`❌ Could not find artist ${artistName} in the main array`);
                }
            }
        }

        // Save the updated data back to the file
        fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), "utf-8");

        console.log(`\n=== SUMMARY ===`);
        console.log(`Total artists with bornElsewhere: ${artistsWithBornElsewhere.length}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);
        console.log(`\n✅ Artists data has been updated and saved to artists.json`);

    } catch (error) {
        console.error("Error adding gender to artists:", error);
        throw error;
    } finally {
        rl.close();
    }
}

// If this script is run directly
if (require.main === module) {
    addGenderToArtists()
        .then(() => {
            console.log("\nGender assignment completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Gender assignment failed:", error);
            process.exit(1);
        });
}

module.exports = addGenderToArtists; 