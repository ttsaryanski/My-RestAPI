import Student from "../../models/classBook/Student.js";

export const studentService = {
    async getAll(query = {}) {
        let students = Student.find();

        if (query.search) {
            students.find({ title: { $regex: query.search, $options: "i" } });
        }
        if (query.limit) {
            students.find().limit(query.limit).sort({ dateUpdate: -1 });
        }

        return students;
    },

    async getAllPaginated(query = {}) {
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
    },

    async create(data, userId) {
        return await Student.create({ ...data, _ownerId: userId });
    },

    async getById(studentId) {
        return await Student.findById(studentId);
    },

    async getByIdPopulate(studentId) {
        return await Student.findById(studentId)
            .populate("grades")
            .populate("grades.class")
            .populate("grades.teacher");
    },

    async remove(studentId) {
        const result = Student.findByIdAndDelete(studentId);
        if (!result) throw new Error("Student not found");
    },

    async edit(studentId, data) {
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

        return await Student.findByIdAndUpdate(studentId, updateQuery, {
            runValidators: true,
            new: true,
        });
    },
};
