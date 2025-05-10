import Game from "../../models/gamesPlay/Game.js";

const getAll = (query = {}) => {
    let games = Game.find().sort({ updatedAt: -1 }).populate("_ownerId");

    if (query.search) {
        games.find({ title: { $regex: query.search, $options: "i" } });
    }
    if (query.limit) {
        games.find().limit(query.limit).sort({ dateUpdate: -1 });
    }

    return games;
};

const getInfinity = async (query = {}) => {
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
};

const lastThree = () => Game.find().sort({ createdAt: -1 }).limit(3);

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
    getInfinity,
    lastThree,
    create,
    getById,
    remove,
    edit,
};
