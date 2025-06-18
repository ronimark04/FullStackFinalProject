const fs = require("fs");
const path = require("path");

async function restoreArtistsJson() {
    try {
        const artistsPath = path.join(__dirname, "artists.json");
        const artists = JSON.parse(fs.readFileSync(artistsPath, "utf-8"));

        console.log(`Processing ${artists.length} artists...`);

        // Process each artist
        const restoredArtists = artists.map(artist => {
            const restoredArtist = { ...artist };

            // Remove gender field if artist doesn't have bornElsewhere data
            if (!artist.bornElsewhere || (!artist.bornElsewhere.eng && !artist.bornElsewhere.heb)) {
                delete restoredArtist.gender;
            }

            // Fix formatting issues in summary text
            if (restoredArtist.summary) {
                if (restoredArtist.summary.eng) {
                    // Fix extra spaces around parentheses
                    restoredArtist.summary.eng = restoredArtist.summary.eng
                        .replace(/\s*\(\s*/g, " (")
                        .replace(/\s*\)\s*/g, ") ")
                        .replace(/\s+/g, " ")
                        .trim();
                }
                if (restoredArtist.summary.heb) {
                    // Fix extra spaces in Hebrew text
                    restoredArtist.summary.heb = restoredArtist.summary.heb
                        .replace(/\s+/g, " ")
                        .trim();
                }
            }

            return restoredArtist;
        });

        // Count artists with gender fields
        const artistsWithGender = restoredArtists.filter(a => a.gender).length;
        const artistsWithBornElsewhere = restoredArtists.filter(a =>
            a.bornElsewhere && (a.bornElsewhere.eng || a.bornElsewhere.heb)
        ).length;

        console.log(`Artists with bornElsewhere: ${artistsWithBornElsewhere}`);
        console.log(`Artists with gender field: ${artistsWithGender}`);

        // Save the restored data
        fs.writeFileSync(artistsPath, JSON.stringify(restoredArtists, null, 2), "utf-8");

        console.log("✅ Artists.json has been restored!");
        console.log("- Gender fields removed from artists without bornElsewhere data");
        console.log("- Text formatting issues fixed");
        console.log("- File structure cleaned up");

    } catch (error) {
        console.error("Error restoring artists.json:", error);
        throw error;
    }
}

// If this script is run directly
if (require.main === module) {
    restoreArtistsJson()
        .then(() => {
            console.log("\nRestoration completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Restoration failed:", error);
            process.exit(1);
        });
}

module.exports = restoreArtistsJson; 