import { CustomError } from "../../utils/customError.js";

import Comment from "../../models/gamesPlay/Comment.js";

export const commentService = {
    async getAll(gameId) {
        return await Comment.find({ gameId: gameId })
            .sort({ updatedAt: -1 })
            .populate("_ownerId");
    },

    async create(data, userId) {
        const newComment = await Comment.create({
            ...data,
            _ownerId: userId,
        });

        if (!newComment) {
            throw new CustomError("Missing or invalid data!", 400);
        }

        return await newComment.populate("_ownerId");
    },

    async remove(commentId) {
        const result = await Comment.findByIdAndDelete(commentId);

        if (!result) {
            throw new CustomError("Comment not found", 404);
        }
    },
};
