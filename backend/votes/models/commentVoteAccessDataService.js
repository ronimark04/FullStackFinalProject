const CommentVote = require('./mongodb/CommentVote');

const voteComment = async (commentId, userId, value) => {
    const existing = await CommentVote.findOne({ comment: commentId, user: userId });

    if (existing) {
        if (existing.value === value) {
            await CommentVote.findByIdAndDelete(existing._id);
            return { message: "Vote removed" };
        } else {
            existing.value = value;
            return await existing.save();
        }
    }

    const vote = new CommentVote({ comment: commentId, user: userId, value });
    return await vote.save();
};

const getVotesByComment = async (commentId) => {
    const votes = await CommentVote.find({ comment: commentId }).select("user value");

    const result = {
        upvotes: {
            count: 0,
            users: []
        },
        downvotes: {
            count: 0,
            users: []
        }
    };

    for (let vote of votes) {
        const uid = vote.user.toString();
        if (vote.value === "up") {
            result.upvotes.count++;
            result.upvotes.users.push(uid);
        } else if (vote.value === "down") {
            result.downvotes.count++;
            result.downvotes.users.push(uid);
        }
    }

    return result;
};


const getVotesByUser = async (userId) => {
    const votes = await CommentVote.find({ user: userId }).select("comment value");

    const result = {
        upvotes: [],
        downvotes: []
    };

    for (let vote of votes) {
        const commentId = vote.comment.toString();
        if (vote.value === "up") {
            result.upvotes.push(commentId);
        } else if (vote.value === "down") {
            result.downvotes.push(commentId);
        }
    }

    return result;
};


module.exports = {
    voteComment,
    getVotesByComment,
    getVotesByUser
};
