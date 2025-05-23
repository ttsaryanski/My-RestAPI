import { Router } from "express";

import { CustomError } from "../../utils/customError.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";

export function adminController(authService, gameService) {
    const router = Router();

    router.get(
        "/games",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const games = await gameService.getInfinity(query);

            res.status(200).json(games);
        })
    );

    router.delete(
        "/games/:gameId",
        asyncErrorHandler(async (req, res) => {
            const gameId = req.params.gameId;

            await gameService.remove(gameId);

            res.status(204).end();
        })
    );

    router.get(
        "/users",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const users = await authService.getAllUsers(query);

            res.status(200).json(users);
        })
    );

    router.get(
        "/users/:userId",
        asyncErrorHandler(async (req, res) => {
            const userId = req.params.userId;

            const user = await authService.makeAdmin(userId);

            res.status(200).json(user);
        })
    );

    router.delete(
        "/users/:userId",
        asyncErrorHandler(async (req, res) => {
            const userId = req.params.userId;

            const user = await authService.getUserById(userId);

            if (!user) {
                throw new CustomError("User not found", 404);
            }

            if (user.role === "admin") {
                throw new CustomError("Cannot delete admin account", 401);
            }

            await authService.remove(userId);

            res.status(204).end();
        })
    );

    return router;
}
