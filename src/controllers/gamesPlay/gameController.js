import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Game from "../../models/gamesPlay/Game.js";

import { gameDto } from "../../validators/gamesPlay/gameDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function gameController(gameService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const games = await gameService.getAll(query);

            res.status(200).json(games);
        })
    );

    router.get(
        "/infinity",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const games = await gameService.getInfinity(query);

            res.status(200).json(games);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const { error } = gameDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const userId = req.user._id;
            const data = req.body;

            const game = await gameService.create(data, userId);

            res.status(201).json(game);
        })
    );

    router.get(
        "/last_three",
        asyncErrorHandler(async (req, res) => {
            const games = await gameService.lastThree();

            res.status(200).json(games);
        })
    );

    router.get(
        "/:gameId",
        asyncErrorHandler(async (req, res) => {
            const gameId = req.params.gameId;

            const game = await gameService.getById(gameId);

            res.status(200).json(game);
        })
    );

    router.put(
        "/:gameId",
        authMiddleware,
        isOwner(Game, "gameId"),
        asyncErrorHandler(async (req, res) => {
            const { error } = gameDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const gameId = req.params.gameId;
            const data = req.body;

            const game = await gameService.edit(gameId, data);

            res.status(201).json(game);
        })
    );

    router.delete(
        "/:gameId",
        authMiddleware,
        isOwner(Game, "gameId"),
        asyncErrorHandler(async (req, res) => {
            const gameId = req.params.gameId;

            await gameService.remove(gameId);

            res.status(204).end();
        })
    );

    return router;
}
