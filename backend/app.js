
const express = require('express');
// const Card = require('./cards/models/mongodb/Card');
const PORT = process.env.PORT || 8181;
const connectToDB = require('./DB/dbService');
const chalk = require('chalk');
require('dotenv').config();
const app = express();
const router = require('./router/router');
const corsMiddleware = require('./middlewares/cors');
const morganLogger = require('./logger/morganLogger');
// const { seedCards, generateSeedUsers } = require("./seedData.js");
const User = require('./users/models/mongodb/User.js');
const seedDatabase = require('./seed_data/seed');
const seedUsersAndComments = require('./seed_data/seedAiData');

app.use(express.json());
app.use(morganLogger);
app.use(corsMiddleware);

app.use(router);

app.listen(PORT, async () => {
    console.log(chalk.bgGreen(`Server is running on port ${PORT}`));
    try {
        await connectToDB(); // Ensure DB connection before seeding
        await seedDatabase(); // Seed areas and artists
        await seedUsersAndComments(); // Seed AI generated users and comments
    } catch (error) {
        console.error(chalk.bgRed("Error during database setup:"), error);
    }

});