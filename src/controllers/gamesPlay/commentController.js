import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isAdmin } from "../../middlewares/isAdminMiddleware.js";

import { commentDto } from "../../validators/gamesPlay/commentDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function commentController(commentService) {
    const router = Router();

    /**
     * @swagger
     * /games_play/comments/{gameId}:
     *   get:
     *     summary: Взема всички коментари за игра
     *     tags: [GamesPlay Comments]
     *     security:
     *       - gamesPlay: []
     *     parameters:
     *       - in: path
     *         name: gameId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID на играта (валиден ObjectId – 24 символа)
     *     responses:
     *       200:
     *         description: Успешно вземане на коментари
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   _id:
     *                     type: string
     *                     example: "60c72b2f9b1e8c001f8e4d3a"
     *                   gameId:
     *                     type: string
     *                     example: "60c72b2f9b1e8c001f8e4d3a"
     *                   content:
     *                     type: string
     *                     example: "This is an example game comment."
     *                   _ownerId:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: "60c72b2f9b1e8c001f8e4d3b"
     *                       email:
     *                         type: string
     *                         example: "owner@email.com"
     *                   createdAt:
     *                     type: string
     *                     format: date-time
     *                     example: "2021-06-14T12:00:00Z"
     *                   updatedAt:
     *                     type: string
     *                     format: date-time
     *                     example: "2021-06-14T12:00:00Z"
     *       400:
     *         description: Bad Request - Невалиден ID
     *         content:
     *           application/json:
     *             example:
     *               message: "Invalid ID format!"
     */
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

    /**
     * @swagger
     * /games_play/comments:
     *   post:
     *     summary: Публикуване на нов коментар
     *     tags: [GamesPlay Comments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - content
     *               - gameId
     *             properties:
     *               content:
     *                 type: string
     *                 example: 'This is a new comment for the game.'
     *               gameId:
     *                 type: string
     *                 example: "60c72b2f9b1e8c001f8e4d3b"
     *     security:
     *       - gamesPlay: []
     *     responses:
     *       201:
     *         description: Успешно публикуване на коментар
     *         content:
     *          application/json:
     *           schema:
     *            type: object
     *            properties:
     *              _id:
     *                type: string
     *                example: "60c72b2f9b1e8c001f8e4d3a"
     *              gameId:
     *                type: string
     *                example: "60c72b2f9b1e8c001f8e4d3a"
     *              content:
     *                type: string
     *                example: "This is a new comment for the game."
     *       400:
     *         description: Bad Request - Невалидни данни
     *         content:
     *           application/json:
     *             examples:
     *              invalidContent:
     *                summary: Invalid content
     *                value:
     *                  message: "Comment must be at least 10 characters!"
     *              invalidGameId:
     *                summary: Invalid gameId
     *                value:
     *                  message: "Invalid game ID format!"
     */
    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const data = req.body;

            const { error: dataError } = commentDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const comment = await commentService.create(data, userId);

            res.status(201).json(comment);
        })
    );

    /**
     * @swagger
     * /games_play/comments/{commentId}:
     *   delete:
     *     summary: Изтрива коментар по ID (само за администратори)
     *     tags: [GamesPlay Comments]
     *     security:
     *       - gamesPlay: []
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID на коментар (валиден ObjectId – 24 символа)
     *     responses:
     *       204:
     *         description: Успешно изтрит коментар
     *       401:
     *         description: Unauthorized - Липсващ токен
     *         content:
     *           application/json:
     *             example:
     *               message: "Invalid token!"
     *       400:
     *         description: Bad Request - Невалиден ID
     *         content:
     *           application/json:
     *             example:
     *               message: "Invalid ID format!"
     *       403:
     *         description: Forbidden - изисква се администраторски достъп
     *         content:
     *           application/json:
     *             example:
     *               message: "Admin access required"
     *       404:
     *         description: Not Found - Коментарът не съществува
     *         content:
     *           application/json:
     *             example:
     *               message: "Comment not found"
     */
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
