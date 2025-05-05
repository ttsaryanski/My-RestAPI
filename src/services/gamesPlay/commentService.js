import Comment from "../../models/gamesPlay/Comment.js";

const getAll = (gameId) =>
    Comment.find({ gameId: gameId }).populate("_ownerId");

const create = async (data, userId) => {
    const newComment = await Comment.create({ ...data, _ownerId: userId });
    return newComment.populate("_ownerId");
};

export default {
    getAll,
    create,
};
