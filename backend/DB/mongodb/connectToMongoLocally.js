const mongoose = require('mongoose');

const connectionStringForMongoDB = process.env.MONGODB_CONNECTION_STRING;

const connectToLocalDB = async () => {
    try {
        await mongoose.connect(connectionStringForMongoDB);
        console.log('Connected to MongoDB locally');
    } catch (error) { console.log('Error connecting to MongoDB:', error); }
};

module.exports = connectToLocalDB;
