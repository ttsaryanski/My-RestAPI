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
        return await Game.create({ ...data, _ownerId: userId });
    },

    async getById(gameId) {
        return await Game.findById(gameId);
    },

    async remove(gameId) {
        const result = await Game.findByIdAndDelete(gameId);
        if (!result) throw new Error("Game not found");
    },

    async edit(gameId, data) {
        data.dateUpdate = Date.now();

        return await Game.findByIdAndUpdate(gameId, data, {
            runValidators: true,
            new: true,
        });
    },
};
