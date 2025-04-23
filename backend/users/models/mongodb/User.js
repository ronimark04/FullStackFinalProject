const { mongoose } = require("mongoose");
const { EMAIL } = require("../../../helpers/mongodb/mongooseValidators");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 15
    },
    email: EMAIL,
    password: {
        type: String,
        required: true,
        trim: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// {
//     "username": "admin",
//     "email": "8H2T4@example.com",
//     "password": "Admin@123!",
//     "isAdmin": true
// }

// {
//     "username": "nonadmin",
//     "email": "nonadmin@example.com",
//     "password": "Nonadmin@123!",
//     "isAdmin": false
// }