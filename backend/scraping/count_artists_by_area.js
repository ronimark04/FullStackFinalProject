const fs = require('fs');

// Load artist data
const artists = JSON.parse(fs.readFileSync('artists.json', 'utf8'));

// Containers for stats
const areaCounts = {};
const errors = [];

let totalArtists = 0;

artists.forEach((artist, index) => {
    try {
        totalArtists++;

        const area = artist.area;

        if (typeof area !== 'string' || !area.trim()) {
            errors.push({
                index,
                name: artist.name?.eng || artist.name?.heb || 'Unknown',
                reason: 'Missing or invalid "area" field',
            });
            return;
        }

        areaCounts[area] = (areaCounts[area] || 0) + 1;
    } catch (err) {
        errors.push({
            index,
            name: artist.name?.eng || artist.name?.heb || 'Unknown',
            reason: `Exception occurred: ${err.message}`,
        });
    }
});

// Sort the area counts by artist count descending
const sortedAreaCounts = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [area, count]) => {
        acc[area] = count;
        return acc;
    }, {});

// Output report
const report = {
    totalArtists,
    areaCounts: sortedAreaCounts,
    errorCount: errors.length,
    errors,
};

fs.writeFileSync('artist_area_report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('✅ Report created: artist_area_report.json');
