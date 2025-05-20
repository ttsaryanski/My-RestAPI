import { CustomError } from "../../utils/customError.js";

import Teacher from "../../models/classBook/Teacher.js";

export const teacherService = {
    async getAll(query = {}) {
        let filter = {};

        if (query.email) {
            filter.email = { email: query.email };
        }

        let teacherQuery = Teacher.find(filter);

        const teachers = await teacherQuery;
        return teachers;
    },

    async create(data, userId) {
        return await Teacher.create({ ...data, _ownerId: userId });
    },

    async getById(teacherId) {
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            throw new CustomError("There is no teacher with this id!", 404);
        }

        return teacher;
    },

    async edit(teacherId, data) {
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

        const editedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateQuery,
            {
                runValidators: true,
                new: true,
            }
        );

        if (!editedTeacher) {
            throw new CustomError(
                "Teacher not found or missing or invalid data!",
                400
            );
        }

        return editedTeacher;
    },
};
