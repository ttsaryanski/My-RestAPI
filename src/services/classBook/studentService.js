import { CustomError } from "../../utils/errorUtils/customError.js";

import Student from "../../models/classBook/Student.js";

export const studentService = {
    async getAll(query = {}) {
        let studentsQuery = Student.find();

        if (query.limit && !isNaN(Number(query.limit))) {
            const limit = Number(query.limit);
            studentsQuery = studentsQuery.limit(limit);
        }

        const students = await studentsQuery;
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
        const student = await Student.findById(studentId);

        if (!student) {
            throw new CustomError("There is no student with this id!", 404);
        }

        return student;
    },

    async getByIdPopulate(studentId) {
        const student = await Student.findById(studentId)
            .populate("grades")
            .populate("grades.class")
            .populate("grades.teacher");

        if (!student) {
            throw new CustomError("There is no student with this id!", 404);
        }

        return student;
    },

    async remove(studentId) {
        const result = Student.findByIdAndDelete(studentId);

        if (!result) {
            throw new CustomError("Student not found", 404);
        }
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

        const editedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateQuery,
            {
                runValidators: true,
                new: true,
            }
        );

        if (!editedStudent) {
            throw new CustomError("Student not found", 404);
        }

        return editedStudent;
    },
};
