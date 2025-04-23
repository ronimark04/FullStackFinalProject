const Comment = require('./mongodb/Comment');

const getAllComments = async () => {
    try {
        return await Comment.find();
    } catch (err) {
        throw err;
    }
};

const getCommentsByArtist = async (artistId) => {
    return await Comment.find({ artist: artistId });
};

const getCommentsByUser = async (userId) => {
    return await Comment.find({ user: userId });
};

const getCommentById = async (commentId) => {
    return await Comment.findById(commentId);
};

const createComment = async (commentData) => {
    const comment = new Comment(commentData);
    return await comment.save();
};

const updateComment = async (commentId, updatedComment) => {
    return await Comment.findByIdAndUpdate(commentId, updatedComment, { new: true });
};

const deleteComment = async (commentId) => {
    return await Comment.findByIdAndDelete(commentId);
};

module.exports = {
    getAllComments,
    getCommentsByArtist,
    getCommentsByUser,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
};
