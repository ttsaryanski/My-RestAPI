import Clss from "../../models/classBook/Clss.js";

export const classService = {
    async getAll(query = {}) {
        let filter = {};

        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }

        let classQuery = Clss.find(filter);

        if (query.limit) {
            const limit = Number(query.limit);
            classQuery = classQuery.limit(limit);
        }

        const classes = await classQuery;
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
        return await Clss.findById(itemId);
    },

    async getByIdPopulate(itemId) {
        return await Clss.findById(itemId)
            .populate("teacher")
            .populate("students");
    },

    async remove(itemId) {
        const result = await Clss.findByIdAndDelete(itemId);
        if (!result) throw new Error("Class not found");
    },

    async edit(itemId, data) {
        data.dateUpdate = Date.now();

        return await Clss.findByIdAndUpdate(itemId, data, {
            runValidators: true,
            new: true,
        });
    },
};
