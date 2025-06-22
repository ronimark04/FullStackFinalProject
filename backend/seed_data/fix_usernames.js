const fs = require('fs');
const path = require('path');

// Read the files
const usersPath = path.join(__dirname, 'users.json');
const commentsPath = path.join(__dirname, 'comments1.json');

const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));

// Extract valid usernames
const validUsernames = users.map(user => user.username);

// Invalid usernames from the error messages
const invalidUsernames = [
    'eurofanatic', 'noa_telaviv', 'david_records', 'shira_brazil', 'latinbeat',
    'galim_guy', 'samira_mom', 'auditionfan', 'haifa_local', 'coffeeaddict',
    'ladino_lover', 'esther_belgrade', 'argentina_roots', 'tzvika_carmel',
    'classicfan', 'worldbeatfan', 'kirya_ata', 'frenchvibes', 'multilangfan',
    'europopfan', 'awardwatcher', 'tunisia_roots', 'mossad_fan', 'herzliya_local',
    'rockhistorian', 'yiddish_lover', 'poland_roots', 'vinyl_collector',
    'music_historian', 'activist_music', 'political_music', 'circus_fan',
    'even_yehuda', 'idan_fan', 'composer_fan', 'flying_baby_fan', 'satire_lover',
    'tel_aviv_rocker', 'rock_revolution', 'feminist_rock', 'social_commentary',
    'dragon_fan', 'escot_fan', 'tel_aviv_rock', 'classic_rock', 'musical_genes',
    'producer_fan', 'dudaim_lover', 'jerusalem_roots', 'bohemian_telaviv',
    'promoter_legend', 'folk_music_fan', 'spiritual_music', 'lod_local',
    'platinum_fan', 'singer_of_year', 'duo_fan', 'spiritual_journey',
    'carusella_fan', 'jerusalem_music', 'festival_goer', 'law_music',
    'egypt_influence', 'guitar_lover', 'music_lover_94', 'beer_sheva_fan',
    'talent_hunter', 'ron_buhbut_fan', 'israeli_pride', 'family_talent',
    'late_bloomer', 'netanya_pride', 'yearly_charts', 'moroccan_roots',
    'talent_show_fan', 'cultural_music', 'docu_fan', 'ofakim_native',
    'artzi_collab', 'wedding_music', 'netivot_music', 'classic_duets',
    'turkish_music', 'or_yehuda_local', 'career_change', 'talk_show_fan',
    'yes_breeze', 'reality_tv', 'bip_channel', 'ambassador_fan', 'haifa_music',
    'duo_legend', 'folk_music', 'us_tour', 'six_day_war', 'eurovision_fan',
    'katamon_pride', 'set_me_free', 'reality_winner', 'ethiopian_roots',
    'idf_bands', 'high_windows_fan', 'rehovot_rock', '80s_music', 'guitar_style',
    'israeli_guitar', 'alternative_influence', 'israeli_alt', 'pioneer_bands'
];

// Create a mapping of invalid usernames to valid ones
const usernameMapping = {};
let validIndex = 0;

invalidUsernames.forEach(invalidUsername => {
    usernameMapping[invalidUsername] = validUsernames[validIndex % validUsernames.length];
    validIndex++;
});

// Replace usernames in comments
let replacements = 0;
comments.forEach(comment => {
    if (usernameMapping[comment.user_username]) {
        comment.user_username = usernameMapping[comment.user_username];
        replacements++;
    }
});

// Write the updated comments back to file
fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 4));

console.log(`Replaced ${replacements} invalid usernames with valid ones.`);
console.log('Updated comments1.json successfully!');

// Verify no invalid usernames remain
const remainingInvalid = comments.filter(comment =>
    !validUsernames.includes(comment.user_username)
);

if (remainingInvalid.length === 0) {
    console.log('✅ All usernames are now valid!');
} else {
    console.log(`❌ Found ${remainingInvalid.length} remaining invalid usernames:`);
    const uniqueInvalid = [...new Set(remainingInvalid.map(c => c.user_username))];
    uniqueInvalid.forEach(username => console.log(`  - ${username}`));
} 