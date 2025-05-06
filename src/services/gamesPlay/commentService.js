import Comment from "../../models/gamesPlay/Comment.js";

const getAll = (gameId) =>
    Comment.find({ gameId: gameId })
        .sort({ updatedAt: -1 })
        .populate("_ownerId");

const create = async (data, userId) => {
    const newComment = await Comment.create({ ...data, _ownerId: userId });
    return newComment.populate("_ownerId");
};

const remove = (commentId) => Comment.findByIdAndDelete(commentId);

export default {
    getAll,
    create,
    remove,
};
