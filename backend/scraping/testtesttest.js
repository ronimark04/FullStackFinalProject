import fs from 'fs';

// Load main artist data and Spotify matches
const baseArtists = JSON.parse(fs.readFileSync('./artists.json', 'utf-8'));
const spotifyData = JSON.parse(fs.readFileSync('./spotify_artists_output.json', 'utf-8'));

// Create a map for quick lookup by English name
const spotifyMap = new Map(
    spotifyData.map((artist) => [artist.nameEng.trim().toLowerCase(), artist])
);

const merged = baseArtists.map((artist) => {
    const key = artist.name.eng.trim().toLowerCase();
    const match = spotifyMap.get(key);

    if (match) {
        artist.spotify = {
            artistId: match.spotifyId,
            embedUrl: match.artistEmbed,
        };
    }

    return artist;
});

// Save merged result
fs.writeFileSync('./artists_with_spotify.json', JSON.stringify(merged, null, 2));
console.log('✅ Merged artist data saved to artists_with_spotify.json');
