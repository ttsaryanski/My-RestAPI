import Student from "../models/Student.js";

const getAll = (query = {}) => {
    let students = Student.find();

    if (query.search) {
        students.find({ title: { $regex: query.search, $options: "i" } });
    }
    if (query.limit) {
        students.find().limit(query.limit).sort({ dateUpdate: -1 });
    }

    return students;
};

const getAllPaginated = async (query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 9;
    const skip = (page - 1) * limit;

    const [students, totalCount] = await Promise.all([
        Student.find().skip(skip).limit(limit),
        Student.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { students, totalCount, totalPages, currentPage };
};

const create = (data, userId) => Student.create({ ...data, _ownerId: userId });

const getById = (studentId) => Student.findById(studentId);

const getByIdPopulate = (studentId) =>
    Student.findById(studentId)
        .populate("grades")
        .populate("grades.class")
        .populate("grades.teacher");

const remove = (studentId) => Student.findByIdAndDelete(studentId);

const edit = (studentId, data) => {
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

    return Student.findByIdAndUpdate(studentId, updateQuery, {
        runValidators: true,
        new: true,
    });
};

const like = (studentId, userId) =>
    Student.findByIdAndUpdate(studentId, {
        $addToSet: { likes: userId, new: true },
    });

const topThree = () => {
    const topRecipes = Student.aggregate([
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

    const [students, totalCount] = await Promise.all([
        Student.find({ _ownerId: ownerId }).skip(skip).limit(limit),
        Student.countDocuments({ _ownerId: ownerId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { students, totalCount, totalPages, currentPage };
};

const getByLikedId = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit;

    const [students, totalCount] = await Promise.all([
        Student.find({ likes: userId }).skip(skip).limit(limit),
        Student.countDocuments({ likes: userId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return { students, totalCount, totalPages, currentPage };
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
