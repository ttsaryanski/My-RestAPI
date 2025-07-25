import { CustomError } from "../../utils/errorUtils/customError.js";

import Comment from "../../models/gamesPlay/Comment.js";

export const commentService = {
    async getAll(gameId) {
        return await Comment.find({ gameId: gameId })
            .sort({ updatedAt: -1 })
            .populate("_ownerId", "-password");
    },

    async create(data, userId) {
        const newComment = await Comment.create({
            ...data,
            _ownerId: userId,
        });

        return await newComment.populate("_ownerId", "-password");
    },

    async remove(commentId) {
        const result = await Comment.findByIdAndDelete(commentId);

        if (!result) {
            throw new CustomError("Comment not found", 404);
        }
    },
};
