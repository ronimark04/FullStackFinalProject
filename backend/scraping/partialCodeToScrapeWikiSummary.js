// TODO: this was originally used to scrape summaries, needs to be edited to fit the creation of a new artist in the admin panel

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Load original file
const artists = JSON.parse(fs.readFileSync('artists.json', 'utf8'));

// Clean text: remove [1], [2], etc.
function cleanText(text) {
    return text
        .replace(/\[\d+\]/g, '')  // remove footnote brackets like [1]
        .trim();
}

// Scrape Wikipedia summary (first ~2–3 good paragraphs only, no headings)
async function scrapeSummary(url) {
    if (!url) return null;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const content = $('#mw-content-text .mw-parser-output').children();
        const result = [];

        for (let i = 0; i < content.length; i++) {
            const el = content[i];

            // Only keep non-trivial paragraph text
            if (el.tagName === 'p') {
                const text = $(el).text().trim();
                if (text.length > 80) {
                    result.push(text);
                }
            }

            if (result.length >= 3) break; // ~3 rich paragraphs is enough
        }

        if (result.length === 0) return null;

        return cleanText(result.join('\n\n'));
    } catch (err) {
        console.warn(`⚠️ Failed to fetch ${url}: ${err.message}`);
        return null;
    }
}

// Process all artists
async function enrichWithSummaries() {
    for (const artist of artists) {
        const wiki = artist.wiki || {};
        const hebUrl = wiki.heb;
        const engUrl = wiki.eng;

        const summary = {
            heb: await scrapeSummary(hebUrl),
            eng: await scrapeSummary(engUrl)
        };

        artist.summary = summary;

        console.log(`✅ Processed: ${artist.name?.eng || artist.name?.heb}`);

        // Avoid hammering Wikipedia
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    fs.writeFileSync('artists_with_summaries.json', JSON.stringify(artists, null, 2), 'utf8');
    console.log('🎉 Done! Saved to "artists_with_summaries.json"');
}

enrichWithSummaries();
