const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'artists_merged_with_summaries.json');

const artists = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const missingSummaryEng = artists.filter(artist =>
    !artist.summary || !artist.summary.eng || artist.summary.eng.trim() === ''
);

console.log(`🧐 Found ${missingSummaryEng.length} artists with missing summary.eng:\n`);

missingSummaryEng.forEach((artist, index) => {
    const name = typeof artist.name === 'object' ? artist.name.heb : artist.name;
    console.log(`${index + 1}. ${name}`);
});
