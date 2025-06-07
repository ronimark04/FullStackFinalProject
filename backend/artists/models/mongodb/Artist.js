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
        default: null
    },
    image: image,
    wiki: {
        heb: { type: String, default: null },
        eng: { type: String, default: null }
    },
    embedUrl: URL,
    spotify: {
        artistId: { type: String, required: true },
        embedUrl: { type: String, required: true }
    },
    isBand: {
        type: Boolean,
        required: true
    },
    yearRange: {
        first: { type: Number, default: null },
        last: { type: Number, default: null }
    }
}, { timestamps: true });

artistSchema.pre("remove", async function (next) {
    const ArtistVote = mongoose.model("ArtistVote");
    const Comment = mongoose.model("Comment");

    await ArtistVote.deleteMany({ artist: this._id });
    await Comment.deleteMany({ artist: this._id });

    next();
});

const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;
