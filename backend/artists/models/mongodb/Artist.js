const mongoose = require("mongoose");
const { URL } = require("../../../helpers/mongodb/mongooseValidators");
const { image } = require("../../../helpers/mongodb/image");

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    birthYear: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{4}$/.test(v); // exactly 4 digits
            },
            message: props => `${props.value} is not a valid 4-digit year!`
        }
    },
    location: {
        type: String,
        required: true,
        default: null
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        // required: true,
        default: null
    },
    image: image,
    wiki: URL,
    embedUrl: URL
});

const Artist = mongoose.model("Artist", artistSchema);

module.exports = Artist;

// {
//     "name": "Ricky Gal",
//     "birthYear": 1950,
//     "area": "Jerusalem",
//     "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Riki_Gal_7.tif/lossy-page1-220px-Riki_Gal_7.tif.jpg",
//     "wiki": "https://he.wikipedia.org/wiki/%D7%A8%D7%99%D7%A7%D7%99_%D7%92%D7%9C",
//     "embedUrl": "https://youtu.be/v0oQcwQNCwM?si=vKvfvXXNMl-J5PiK"
// }