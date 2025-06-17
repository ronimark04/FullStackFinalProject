const fs = require('fs');
const path = require('path');
const connectToDB = require('../DB/dbService');
const Artist = require('../artists/models/mongodb/Artist');

const updateArtistImages = async () => {
    try {
        // Connect to database
        await connectToDB();

        // Read artists.json
        const artistsJsonPath = path.join(__dirname, '../seed_data/artists.json');
        const artistsJson = JSON.parse(fs.readFileSync(artistsJsonPath, 'utf8'));

        // Get all artists from database
        const dbArtists = await Artist.find();

        // Create a map of artists by name for quick lookup
        const artistsByName = {};
        artistsJson.forEach(artist => {
            const key = `${artist.name.eng}-${artist.name.heb}`;
            artistsByName[key] = artist;
        });

        // Update images where they differ
        let updatedCount = 0;
        for (const dbArtist of dbArtists) {
            const key = `${dbArtist.name.eng}-${dbArtist.name.heb}`;
            const jsonArtist = artistsByName[key];

            if (jsonArtist && jsonArtist.image.url !== dbArtist.image.url) {
                console.log(`Updating image for ${dbArtist.name.eng}:`);
                console.log(`Old URL: ${dbArtist.image.url}`);
                console.log(`New URL: ${jsonArtist.image.url}`);

                dbArtist.image.url = jsonArtist.image.url;
                await dbArtist.save();
                updatedCount++;
            }
        }

        console.log(`\nUpdate complete. Updated ${updatedCount} artists.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating artist images:', error);
        process.exit(1);
    }
};

updateArtistImages();