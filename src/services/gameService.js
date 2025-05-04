import Game from "../models/Game.js";

const getAll = (query = {}) => {
    let games = Game.find().sort({ updatedAt: -1 });

    if (query.search) {
        games.find({ title: { $regex: query.search, $options: "i" } });
    }
    if (query.limit) {
        games.find().limit(query.limit).sort({ dateUpdate: -1 });
    }

    return games;
};

const lastThree = () => {
    const lastThreeGames = Game.find().sort({ createdAt: -1 }).limit(3);

    return lastThreeGames;
};

const create = (data, userId) => Game.create({ ...data, _ownerId: userId });

const getById = (gameId) => Game.findById(gameId);

const remove = (gameId) => Game.findByIdAndDelete(gameId);

const edit = (gameId, data) => {
    data.dateUpdate = Date.now();

    return Game.findByIdAndUpdate(gameId, data, {
        runValidators: true,
        new: true,
    });
};

export default {
    getAll,
    lastThree,
    create,
    getById,
    remove,
    edit,
};
