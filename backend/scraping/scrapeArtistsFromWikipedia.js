const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { artistSlugs } = require("./artistsForScraping");

const WIKI_BASE = "https://he.wikipedia.org/wiki/";

function extractBirthYear($) {
    try {
        let birthRow = $('th')
            .filter((_, el) => $(el).text().trim() === 'לידה')
            .first()
            .parent();

        const yearLink = birthRow.find('td a[title]').filter((_, a) => {
            const year = $(a).attr('title');
            return /^\d{4}$/.test(year);
        }).first();

        if (yearLink.length) {
            return parseInt(yearLink.attr('title'));
        }
    } catch (err) {
        console.error("Error extracting birth year:", err.message);
    }

    return null;
}

function extractLocation($) {
    const hebrewMonths = [
        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי",
        "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];

    try {
        const birthRow = $('th')
            .filter((_, el) => $(el).text().trim() === 'לידה')
            .first()
            .parent();

        const td = birthRow.find('td').first();
        let text = td.text().trim();

        // Remove age in parentheses (e.g., (בן 39), (בת 65))
        text = text.replace(/\(.*?\)/g, '');

        // Remove all numbers (day/year)
        text = text.replace(/\d+/g, '');

        // Remove Hebrew month names
        for (const month of hebrewMonths) {
            text = text.replace(new RegExp(month, 'g'), '');
        }

        // Normalize whitespace and trim
        text = text.replace(/\s+/g, ' ').trim();

        // Remove leading "ב " if present
        text = text.replace(/^ב\s/, '');

        // Remove the word "ישראל" anywhere in the string
        text = text.replace(/ישראל/g, '').trim();

        // Split by commas and take the last non-empty part
        const parts = text.split(',').map(p => p.trim()).filter(Boolean);

        let location = parts.pop() || '';

        // If location is empty after cleanup, return null
        if (!location || location === '') {
            return null;
        }

        return location;

    } catch (err) {
        console.error("Error extracting location:", err.message);
    }

    return null;
}



function extractWikiExcerpt($) {
    const firstParagraph = $("p").first().text().trim();
    return firstParagraph.replace(/\[\d+\]/g, ""); // remove reference numbers like [1]
}

function extractImage($) {
    const infoboxImage = $(".infobox img").first();
    const src = infoboxImage.attr("src");
    if (src) {
        return "https:" + src;
    }
    return null;
}

function extractName($) {
    return $("#firstHeading").text().trim();
}

(async () => {
    const results = [];

    for (let slug of artistSlugs) {
        const url = WIKI_BASE + slug;
        console.log("Fetching", url);

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const artist = {
                name: extractName($),
                birthYear: extractBirthYear($),
                location: extractLocation($),
                area: "",
                image: extractImage($),
                wiki: url,
                wikiExcerpt: extractWikiExcerpt($),
                embedUrl: null // placeholder for later YouTube logic
            };

            results.push(artist);
        } catch (err) {
            console.error("Error fetching", url, err.message);
        }
    }

    fs.writeFileSync("artists.json", JSON.stringify(results, null, 2), "utf8");
    console.log("Done. Saved to artists.json");
})();
