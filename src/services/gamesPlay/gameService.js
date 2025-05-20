import { CustomError } from "../../utils/customError.js";

import Game from "../../models/gamesPlay/Game.js";

export const gameService = {
    async getAll(query = {}) {
        let filter = {};

        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }

        let gamesQuery = Game.find(filter)
            .sort({ updatedAt: -1 })
            .populate("_ownerId");

        if (query.limit) {
            const limit = Number(query.limit);
            gamesQuery = gamesQuery.limit(limit);
        }

        const games = await gamesQuery;
        return games;
    },

    async getInfinity(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const [games] = await Promise.all([
            Game.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("_ownerId"),
            Game.countDocuments(),
        ]);

        return { games };
    },

    async lastThree() {
        return await Game.find().sort({ createdAt: -1 }).limit(3);
    },

    async create(data, userId) {
        const newGame = await Game.create({ ...data, _ownerId: userId });

        if (!newGame) {
            throw new CustomError("Missing or invalid data!", 400);
        }

        return newGame;
    },

    async getById(gameId) {
        const game = await Game.findById(gameId);

        if (!game) {
            throw new CustomError("There is no game with this id!", 404);
        }

        return game;
    },

    async remove(gameId) {
        const result = await Game.findByIdAndDelete(gameId);
        if (!result) {
            throw new CustomError("Game not found", 404);
        }
    },

    async edit(gameId, data) {
        const editedGame = await Game.findByIdAndUpdate(gameId, data, {
            runValidators: true,
            new: true,
        });

        if (!editedGame) {
            throw new CustomError(
                "Game not found or missing or invalid data!",
                400
            );
        }

        return editedGame;
    },
};
