import Clss from "../models/Clss.js";

const getAll = (query = {}) => {
    let classes = Clss.find();

    if (query.search) {
        classes.find({ title: { $regex: query.search, $options: "i" } });
    }
    if (query.limit) {
        classes.find().limit(query.limit).sort({ dateUpdate: -1 });
    }

    return classes;
};

const getAllPaginated = async (query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 9;
    const skip = (page - 1) * limit;

    const [classes, totalCount] = await Promise.all([
        Clss.find().skip(skip).limit(limit),
        Clss.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { classes, totalCount, totalPages, currentPage };
};

const create = (data, userId) => Clss.create({ ...data, _createdBy: userId });

const getById = (itemId) => Clss.findById(itemId);

const getByIdPopulate = (itemId) =>
    Clss.findById(itemId).populate("teacher").populate("students");

const remove = (itemId) => Clss.findByIdAndDelete(itemId);

const edit = (itemId, data) => {
    data.dateUpdate = Date.now();

    return Clss.findByIdAndUpdate(itemId, data, {
        runValidators: true,
        new: true,
    });
};

const like = (clssId, userId) =>
    Clss.findByIdAndUpdate(clssId, {
        $addToSet: { likes: userId, new: true },
    });

const topThree = () => {
    const topClasses = Clss.aggregate([
        {
            $addFields: {
                likesCount: { $size: "$likes" },
            },
        },
        {
            $sort: {
                likesCount: -1,
                dateUpdate: -1,
            },
        },
        {
            $limit: 3,
        },
    ]);

    return topClasses;
};

const getByOwnerId = async (ownerId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit;

    const [classes, totalCount] = await Promise.all([
        Clss.find({ _ownerId: ownerId }).skip(skip).limit(limit),
        Clss.countDocuments({ _ownerId: ownerId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { classes, totalCount, totalPages, currentPage };
};

const getByLikedId = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit;

    const [classes, totalCount] = await Promise.all([
        Clss.find({ likes: userId }).skip(skip).limit(limit),
        Clss.countDocuments({ likes: userId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { classes, totalCount, totalPages, currentPage };
};

export default {
    getAll,
    getAllPaginated,
    create,
    getById,
    getByIdPopulate,
    remove,
    edit,
    like,
    topThree,
    getByOwnerId,
    getByLikedId,
};
