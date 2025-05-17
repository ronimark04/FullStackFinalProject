import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const ARTISTS_PATH = './artists.json';
const OUTPUT_PATH = './spotify_artists_output.json';
const FAILED_PATH = './failed_artists.json';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

function cleanName(name) {
    return name.replace(/\(.*?\)/g, '').trim();
}

async function getAccessToken() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    return data.access_token;
}

async function searchArtist(name, token) {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return data.artists?.items?.[0] || null;
}

async function main() {
    const artists = JSON.parse(fs.readFileSync(ARTISTS_PATH));
    const token = await getAccessToken();

    const results = [];
    const failed = [];

    for (const artist of artists) {
        const nameHeb = cleanName(artist.name.heb);
        const nameEng = cleanName(artist.name.eng);

        console.log(`🔍 Searching: ${nameHeb} / ${nameEng}`);

        let artistData = await searchArtist(nameHeb, token);
        if (!artistData) {
            artistData = await searchArtist(nameEng, token);
        }

        if (!artistData) {
            console.warn(`❌ Failed: ${nameEng}`);
            failed.push(nameEng);
            continue;
        }

        const artistEmbed = `https://open.spotify.com/embed/artist/${artistData.id}`;

        results.push({
            nameEng,
            nameHeb,
            spotifyId: artistData.id,
            artistEmbed,
        });

        console.log(`✅ Success: ${nameEng}`);
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
    fs.writeFileSync(FAILED_PATH, JSON.stringify(failed, null, 2));
}

main();
