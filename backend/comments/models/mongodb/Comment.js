const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
        },
        reply_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
