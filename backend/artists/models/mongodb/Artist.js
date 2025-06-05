const mongoose = require("mongoose");
const { URL } = require("../../../helpers/mongodb/mongooseValidators");
const { image } = require("../../../helpers/mongodb/image");

// Reusable field structure for multilingual text
const localizedString = {
    heb: { type: String, required: true },
    eng: { type: String, required: true }
};

const optionalLocalizedString = {
    heb: { type: String, default: null },
    eng: { type: String, default: null }
};

const artistSchema = new mongoose.Schema({
    name: {
        type: localizedString,
        required: true
    },
    isBand: {
        type: Boolean,
        required: true
    },
    birthYear: {
        type: Number,
        validate: {
            validator: function (v) {
                if (this.isBand) return v == null;
                return /^\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid 4-digit year!`
        }
    },
    yearRange: {
        first: {
            type: Number,
            validate: {
                validator: function (v) {
                    if (!this.isBand) return v == null;
                    return /^\d{4}$/.test(v);
                },
                message: props => `${props.value} is not a valid 4-digit year!`
            }
        },
        last: {
            type: Number,
            default: null,
            validate: {
                validator: function (v) {
                    if (!this.isBand || v == null) return true;
                    return /^\d{4}$/.test(v);
                },
                message: props => `${props.value} is not a valid 4-digit year!`
            }
        }
    },
    location: {
        type: localizedString,
        required: true
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
        required: true
    },
    image: image,
    wiki: {
        type: optionalLocalizedString,
        required: true
    },
    bornElsewhere: {
        type: optionalLocalizedString,
        default: null
    },
    summary: {
        type: localizedString,
        required: true
    },
    spotify: {
        artistId: { type: String, required: true },
        embedUrl: URL        // ✅ using imported schema snippet
    }
});

const Artist = mongoose.model("Artist", artistSchema);

module.exports = Artist;
