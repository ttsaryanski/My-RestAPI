import { CustomError } from "../../utils/errorUtils/customError.js";

import Clss from "../../models/classBook/Clss.js";

export const classService = {
    async getAll(query = {}) {
        let filter = {};

        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }

        let classesQuery = Clss.find(filter);

        if (query.limit) {
            const limit = Number(query.limit);
            classesQuery = classesQuery.limit(limit);
        }

        const classes = await classesQuery;
        return classes;
    },

    async getAllPaginated(query = {}) {
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
    },

    async create(data, userId) {
        return await Clss.create({ ...data, _createdBy: userId });
    },

    async getById(itemId) {
        const clss = await Clss.findById(itemId);

        if (!clss) {
            throw new CustomError("There is no class with this id!", 404);
        }

        return clss;
    },

    async getByIdPopulate(itemId) {
        const clss = await Clss.findById(itemId)
            .populate("teacher")
            .populate("students");

        if (!clss) {
            throw new CustomError("There is no class with this id!", 404);
        }

        return clss;
    },

    async remove(itemId) {
        const result = await Clss.findByIdAndDelete(itemId);

        if (!result) {
            throw new CustomError("Class not found", 404);
        }
    },

    async edit(itemId, data) {
        data.dateUpdate = Date.now();

        return await Clss.findByIdAndUpdate(itemId, data, {
            runValidators: true,
            new: true,
        });
    },
};
