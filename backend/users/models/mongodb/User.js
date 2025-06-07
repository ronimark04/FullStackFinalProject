const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

userSchema.pre("remove", async function (next) {
    const ArtistVote = mongoose.model("ArtistVote");
    const CommentVote = mongoose.model("CommentVote");

    await ArtistVote.deleteMany({ user: this._id });
    await CommentVote.deleteMany({ user: this._id });

    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
