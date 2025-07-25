import { Router } from "express";

import { CustomError } from "../../utils/errorUtils/customError.js";
import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";

import { mongooseIdDto } from "../../validators/mongooseIdDto.js";
import { paginationPageDto } from "../../validators/paginationDto.js";

export function adminController(authService, gameService, visitService) {
    const router = Router();

    router.get(
        "/games",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const { error: idError } = paginationPageDto.validate(query);
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const games = await gameService.getInfinity(query);

            res.status(200).json(games);
        })
    );

    router.delete(
        "/games/:gameId",
        asyncErrorHandler(async (req, res) => {
            const gameId = req.params.gameId;

            const { error: idError } = mongooseIdDto.validate({ id: gameId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            await gameService.remove(gameId);

            res.status(204).end();
        })
    );

    router.get(
        "/users",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const { error: idError } = paginationPageDto.validate(query);
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const users = await authService.getAllUsers(query);

            res.status(200).json(users);
        })
    );

    router.patch(
        "/users/:userId",
        asyncErrorHandler(async (req, res) => {
            const userId = req.params.userId;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const user = await authService.makeAdmin(userId);
            if (!user) {
                throw new CustomError("User not found", 404);
            }

            res.status(200).json(user);
        })
    );

    router.delete(
        "/users/:userId",
        asyncErrorHandler(async (req, res) => {
            const userId = req.params.userId;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const user = await authService.getUserById(userId);
            if (!user) {
                throw new CustomError("User not found", 404);
            }

            if (user.role === "admin") {
                throw new CustomError("Cannot delete admin account", 403);
            }

            await authService.remove(userId);

            res.status(204).end();
        })
    );

    router.get(
        "/stats",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const { error: idError } = paginationPageDto.validate(query);
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const result = await visitService.getStats(query);
            const payload = {
                stats: result.filtered,
                totalCount: result.totalCount,
            };

            res.status(200).json(payload);
        })
    );

    return router;
}
