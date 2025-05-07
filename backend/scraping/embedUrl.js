require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const axios = require('axios');

const artists = require('./artists.json');

async function getEmbedUrl(artistName) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const query = encodeURIComponent(artistName);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoEmbeddable=true&key=${apiKey}&maxResults=1`;

    try {
        console.log(`Requesting: ${artistName}`);
        const res = await axios.get(url);
        const items = res.data.items;

        if (Array.isArray(items) && items.length > 0 && items[0].id && items[0].id.videoId) {
            return `https://www.youtube.com/embed/${items[0].id.videoId}`;
        } else {
            console.warn(`No valid video found for: ${artistName}`, items);
        }
    } catch (err) {
        console.error(`Error fetching video for ${artistName}:`, err.message);
    }

    return null;
}

(async () => {
    for (const artist of artists) {
        if (!artist.embedUrl) {
            console.log(`Fetching video for: ${artist.name}`);
            artist.embedUrl = await getEmbedUrl(artist.name);
        }
    }

    fs.writeFileSync('./artists_with_embed.json', JSON.stringify(artists, null, 2), 'utf-8');
    console.log('Updated artists_with_embed.json with embed URLs');
})();
