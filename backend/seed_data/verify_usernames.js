const fs = require('fs');

const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
const comments = JSON.parse(fs.readFileSync('comments1.json', 'utf8'));

const validUsernames = users.map(u => u.username);
const invalid = comments.filter(c => !validUsernames.includes(c.user_username));

console.log('Remaining invalid usernames:', invalid.length);

if (invalid.length > 0) {
    const unique = [...new Set(invalid.map(c => c.user_username))];
    console.log('Invalid usernames:', unique);
} else {
    console.log('✅ All usernames are valid!');
} 