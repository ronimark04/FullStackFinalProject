const bcrypt = require('bcryptjs');

async function generateSeedUsers() {
    return [{
        "_id": "524e0117e04f41e4b1c8c6b9",
        "name": {
            "first": "Ronnie",
            "middle": "",
            "last": "Markevich",
        },
        "phone": "0549371999",
        "email": "roni.mark@gmail.com",
        "password": await bcrypt.hash("Admin@123", 10),
        "image": {
            "url": "https://raw.githubusercontent.com/ronimark04/Ronnie-Markevich-Final-Projects/refs/heads/main/images/ronnie-profile-image.png",
            "alt": "Ronnie Markevich",
        },
        "address": {
            "state": "",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Maor Hagola",
            "houseNumber": 48,
            "zip": 6603986,
        },
        "isAdmin": true,
        "isBusiness": true,
    },
    {
        "_id": "6c55b66259f04078bb9a2813",
        "name": {
            "first": "Barack",
            "middle": "Hussein",
            "last": "Obama",
        },
        "phone": "0555555555",
        "email": "bhobama@whitehouse.gov",
        "password": await bcrypt.hash("44Pres@usa", 10),
        "image": {
            "url": "https://images.prismic.io/thedecisionlab/cc70a04a-f6a5-40fd-9799-4a61b89e51bc_barack-obama.png?auto=format,compress",
            "alt": "Barack Hussein Obama",
        },
        "address": {
            "state": "District of Columbia",
            "country": "United States of America",
            "city": "Washington, D.C.",
            "street": "Pennsylvania Avenue",
            "houseNumber": 1600,
            "zip": 20500,
        },
        "isAdmin": false,
        "isBusiness": false,
    },
    {
        "_id": "53aad864fc3447c0af87c0e2",
        "name": {
            "first": "Pnina",
            "middle": "",
            "last": "Rosenblum",
        },
        "phone": "0548123456",
        "email": "pnina@rosenblum.co.il",
        "password": await bcrypt.hash("Pnina!789", 10),
        "image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/9/94/Pnina_Rosenblum.jpg",
            "alt": "Pnina Rosenblum",
        },
        "address": {
            "state": "",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Gronneman",
            "houseNumber": 15,
            "zip": 6997222,
        },
        "isAdmin": false,
        "isBusiness": true,
    }]
}

const seedCards = [
    {
        "title": "Pnina Rosenblum Ltd.",
        "subtitle": "Cosmetics and Beauty Products",
        "description": "An Israeli cosmetics and care company with 30 years of experience.",
        "phone": "052-4000001",
        "email": "ltd@rosenblum.com",
        "web": "https://www.pninar.com",
        "image": {
            "url": "https://www.pninar.com/assets/images/logo.png",
            "alt": "Pnina Rosenblum Ltd.",
        },
        "address": {
            "state": "",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Menachem Begin",
            "houseNumber": 156,
            "zip": 6492108,
        },
        "bizNumber": 1000000,
        "likes": ["524e0117e04f41e4b1c8c6b9", "6c55b66259f04078bb9a2813"],
        "user_id": "53aad864fc3447c0af87c0e2",
        "createdAt": "2023-11-01T09:59:14.778Z",
        "__v": 0
    },
    {
        "title": "CIA",
        "subtitle": "Central Intelligence Agency",
        "description": "A civilian foreign intelligence service of the federal government of the United States tasked with gathering, processing, and analyzing national security information from around the world",
        "phone": "050-0000000",
        "email": "cia@usa.gov",
        "web": "https://www.cia.gov",
        "image": {
            "url": "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0689be1-5d02-4e5d-8513-43fa9d1eb519_1050x700.jpeg",
            "alt": "The CIA",
        },
        "address": {
            "state": "Virginia",
            "country": "United States of America",
            "city": "Langley",
            "street": "Colonial Farm Road",
            "houseNumber": 1000,
            "zip": 0,
        },
        "bizNumber": 2000000,
        "likes": ["524e0117e04f41e4b1c8c6b9", "53aad864fc3447c0af87c0e2"],
        "user_id": "6c55b66259f04078bb9a2813",
        "createdAt": "2023-11-01T09:59:14.778Z",
        "__v": 0
    },
    {
        "title": "Barby",
        "subtitle": "Vanue",
        "description": "Live venue for top Israeli and international performers",
        "phone": "050-0000000",
        "email": "barby@gmail.com",
        "web": "https://barby.co.il",
        "image": {
            "url": "https://barby.co.il/static/media/barbylogoclean.ee9cd3a90a645e4728c8.png",
            "alt": "Barby Club",
        },
        "address": {
            "state": "",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Hanamal",
            "houseNumber": 1,
            "zip": 6350627,
        },
        "bizNumber": 3000000,
        "likes": ["524e0117e04f41e4b1c8c6b9", "6c55b66259f04078bb9a2813", "53aad864fc3447c0af87c0e2"],
        "user_id": "524e0117e04f41e4b1c8c6b9",
        "createdAt": "2023-11-01T09:59:14.778Z",
        "__v": 0
    }
]

module.exports = { generateSeedUsers, seedCards }