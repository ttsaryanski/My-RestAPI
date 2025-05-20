import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isAdmin } from "../../middlewares/isAdminMiddleware.js";

import { createErrorMsg } from "../../utils/errorUtil.js";

export function commentController(commentService) {
    const router = Router();

    router.get("/:gameId", async (req, res) => {
        const gameId = req.params.gameId;
        try {
            const comments = await commentService.getAll(gameId);

            res.status(200).json(comments).end();
        } catch (error) {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    });

    router.post("/", authMiddleware, async (req, res) => {
        const userId = req.user._id;
        const data = req.body;

        try {
            const comment = await commentService.create(data, userId);

            res.status(201).json(comment).end();
        } catch (error) {
            if (error.message.includes("validation")) {
                res.status(400)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else if (error.message === "Missing or invalid data!") {
                res.status(400)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else {
                res.status(500)
                    .json({ message: createErrorMsg(error) })
                    .end();
            }
        }
    });

    router.delete("/:commentId", authMiddleware, isAdmin, async (req, res) => {
        const commentId = req.params.commentId;

        try {
            await commentService.remove(commentId);

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    });

    return router;
}
