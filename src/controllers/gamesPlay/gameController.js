import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Game from "../../models/gamesPlay/Game.js";

import { createErrorMsg } from "../../utils/errorUtil.js";

export function gameController(gameService) {
    const router = Router();

    router.get("/", async (req, res) => {
        const query = req.query;

        try {
            const games = await gameService.getAll(query);

            res.status(200).json(games).end();
        } catch (error) {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    });

    router.get("/infinity", async (req, res) => {
        const query = req.query;

        try {
            const games = await gameService.getInfinity(query);

            res.status(200).json(games).end();
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
            const game = await gameService.create(data, userId);

            res.status(201).json(game).end();
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

    router.get("/last_three", async (req, res) => {
        try {
            const games = await gameService.lastThree();

            res.status(200).json(games).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    });

    router.get("/:gameId", async (req, res) => {
        const gameId = req.params.gameId;

        try {
            const game = await gameService.getById(gameId);

            if (game !== null) {
                res.status(200).json(game).end();
            } else {
                res.status(404)
                    .json({ message: "There is no game with this id." })
                    .end();
            }
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    });

    router.put(
        "/:gameId",
        authMiddleware,
        isOwner(Game, "gameId"),
        async (req, res) => {
            const gameId = req.params.gameId;
            const data = req.body;

            try {
                const game = await gameService.edit(gameId, data);

                res.status(201).json(game).end();
            } catch (error) {
                if (error.message.includes("validation")) {
                    res.status(400).json({ message: createErrorMsg(error) });
                } else if (error.message === "Missing or invalid data!") {
                    res.status(404).json({ message: createErrorMsg(error) });
                } else {
                    res.status(500).json({ message: createErrorMsg(error) });
                }
            }
        }
    );

    router.delete(
        "/:gameId",
        authMiddleware,
        isOwner(Game, "gameId"),
        async (req, res) => {
            const gameId = req.params.gameId;

            try {
                await gameService.remove(gameId);

                res.status(204).end();
            } catch (error) {
                res.status(500).json({ message: createErrorMsg(error) });
            }
        }
    );

    return router;
}
