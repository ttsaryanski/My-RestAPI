import { Router } from "express";

import gameService from "../services/gameService.js";

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

//router.post("/", authMiddleware, async (req, res) => {
router.post("/", async (req, res) => {
    //const userId = await req.cookies?.auth_coocking?.user?._id;
    const userId = null;
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

export default router;
