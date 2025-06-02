import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isAdmin } from "../../middlewares/isAdminMiddleware.js";

import { commentDto } from "../../validators/gamesPlay/commentDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function commentController(commentService) {
    const router = Router();

    router.get(
        "/:gameId",
        asyncErrorHandler(async (req, res) => {
            const gameId = req.params.gameId;

            const { error: idError } = mongooseIdDto.validate({ id: gameId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const comments = await commentService.getAll(gameId);

            res.status(200).json(comments);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = commentDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const comment = await commentService.create(data, userId);

            res.status(201).json(comment);
        })
    );

    router.delete(
        "/:commentId",
        authMiddleware,
        isAdmin,
        asyncErrorHandler(async (req, res) => {
            const commentId = req.params.commentId;

            const { error: idError } = mongooseIdDto.validate({
                id: commentId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            await commentService.remove(commentId);

            res.status(204).end();
        })
    );

    return router;
}
