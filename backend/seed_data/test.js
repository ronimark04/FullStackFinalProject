const fs = require('fs');
const path = require('path');

const areasPath = path.join(__dirname, 'areas.json');
const artistsPath = path.join(__dirname, 'artists.json');

const areas = JSON.parse(fs.readFileSync(areasPath, 'utf8'));
const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf8'));

// Build a set of normalized area names
const areaSet = new Set(
    areas.map(a => (a.name || '').toLowerCase().trim())
);

let missing = [];

artists.forEach((artist, idx) => {
    const areaName = (artist.area || '').toLowerCase().trim();
    if (!areaSet.has(areaName)) {
        missing.push({
            index: idx,
            name: artist.name,
            area: artist.area
        });
    }
});

console.log(`Artists with area not found in areas.json: ${missing.length}`);
missing.forEach(a => {
    console.log(
        `Index: ${a.index}, Name: ${JSON.stringify(a.name)}, Area: '${a.area}'`
    );
});