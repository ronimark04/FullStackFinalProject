const fs = require("fs");

// Load artists.json
const artists = JSON.parse(fs.readFileSync("artists.json", "utf-8"));

// Transform image field
const updated = artists.map(artist => {
    const updatedArtist = { ...artist };

    // Convert string image to object
    if (typeof artist.image === "string") {
        updatedArtist.image = {
            url: artist.image,
            alt: artist.name.eng || "artist"
        };
    }

    return updatedArtist;
});

// Save the new file
fs.writeFileSync("artists_with_images.json", JSON.stringify(updated, null, 2), "utf-8");
console.log("✅ Created artists_with_images.json with updated image objects.");
