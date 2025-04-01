import Teacher from "../models/Teacher.js";

const getAll = (query = {}) => {
    let teachers = Teacher.find();

    if (query.search) {
        teachers.find({ title: { $regex: query.search, $options: "i" } });
    }
    if (query.limit) {
        teachers.find().limit(query.limit).sort({ dateUpdate: -1 });
    }
    if (query.email) {
        teachers.find({ email: query.email });
    }

    return teachers;
};

const getAllPaginated = async (query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 9;
    const skip = (page - 1) * limit;

    const [teachers, totalCount] = await Promise.all([
        Teacher.find().skip(skip).limit(limit).sort({ dateUpdated: -1 }),
        Teacher.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { teachers, totalCount, totalPages, currentPage };
};

const create = (data, userId) => Teacher.create({ ...data, _ownerId: userId });

const getById = (teacherId) => Teacher.findById(teacherId);

const remove = (teacherId) => Teacher.findByIdAndDelete(teacherId);

const edit = async (teacherId, data) => {
    data.dateUpdate = Date.now();
    const updateQuery = { ...data };

    if (data.clssToAdd) {
        updateQuery.$push = { clss: data.clssToAdd };
        delete updateQuery.clssToAdd;
    }

    if (data.clssToRemove) {
        updateQuery.$pull = { clss: data.clssToRemove };
        delete updateQuery.clssToRemove;
    }

    return Teacher.findByIdAndUpdate(teacherId, updateQuery, {
        runValidators: true,
        new: true,
    });
};

const like = (teacherId, userId) =>
    Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { likes: userId, new: true },
    });

const topThree = () => {
    const topRecipes = Teacher.aggregate([
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

    return topRecipes;
};

const getByOwnerId = async (ownerId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit;

    const [teachers, totalCount] = await Promise.all([
        Teacher.find({ _ownerId: ownerId })
            .skip(skip)
            .limit(limit)
            .sort({ dateUpdated: -1 }),
        Teacher.countDocuments({ _ownerId: ownerId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { teachers, totalCount, totalPages, currentPage };
};

const getByLikedId = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit;

    const [teachers, totalCount] = await Promise.all([
        Teacher.find({ likes: userId })
            .skip(skip)
            .limit(limit)
            .sort({ dateUpdated: -1 }),
        Teacher.countDocuments({ likes: userId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { teachers, totalCount, totalPages, currentPage };
};

export default {
    getAll,
    getAllPaginated,
    create,
    getById,
    remove,
    edit,
    like,
    topThree,
    getByOwnerId,
    getByLikedId,
};
