const fs = require('fs');
const path = require('path');

// Load data
const artists = JSON.parse(fs.readFileSync(path.join(__dirname, 'artists_with_isBand.json')));
const areas = JSON.parse(fs.readFileSync(path.join(__dirname, 'areas_start.json')));

// Prepare results
const areaCounts = {};
const unmatchedArtists = [];

for (const [areaName, locations] of Object.entries(areas)) {
    areaCounts[areaName] = 0;
}

// Process each artist
artists.forEach(artist => {
    const location = artist.location;
    let matched = false;

    for (const [area, locations] of Object.entries(areas)) {
        if (locations.includes(location)) {
            areaCounts[area]++;
            matched = true;
            break;
        }
    }

    if (!matched) {
        unmatchedArtists.push({ name: artist.name, location });
    }
});

// Add total count
const total = Object.values(areaCounts).reduce((sum, val) => sum + val, 0);

// Write result to file
const output = {
    totalArtists: total,
    artistsPerArea: areaCounts,
    unmatchedArtists: unmatchedArtists
};

fs.writeFileSync(path.join(__dirname, 'artistAreaCounts.json'), JSON.stringify(output, null, 2), 'utf-8');

console.log('✅ artistAreaCounts.json created.');
console.log(`❗ Unmatched artists: ${unmatchedArtists.length}`);
unmatchedArtists.forEach(a => console.log(`- ${a.name}: "${a.location}"`));
