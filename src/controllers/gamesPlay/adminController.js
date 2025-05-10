import { Router } from "express";

import gameService from "../../services/gamesPlay/gameService.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import authServiceForGamesPlay from "../../services/gamesPlay/authServiceForGamesPlay.js";

const router = Router();

router.get("/games", async (req, res) => {
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

router.delete("/games/:gameId", async (req, res) => {
    const gameId = req.params.gameId;

    try {
        await gameService.remove(gameId);

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/users", async (req, res) => {
    const query = req.query;

    try {
        const users = await authServiceForGamesPlay.getAllUsers(query);

        res.status(200).json(users).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.get("/users/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await authServiceForGamesPlay.makeAdmin(userId);

        res.status(200).json(user).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.delete("/users/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await authServiceForGamesPlay.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "admin") {
            return res
                .status(403)
                .json({ message: "Cannot delete admin account" });
        }

        try {
            await authServiceForGamesPlay.remove(userId);

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

export default router;
