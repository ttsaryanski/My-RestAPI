import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { editTeacherDto } from "../../validators/classBook/teacherDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function teacherController(teacherService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const teachers = await teacherService.getAll(query);

            res.status(200).json(teachers);
        })
    );

    router.get(
        "/:teacherId",
        asyncErrorHandler(async (req, res) => {
            const teacherId = req.params.teacherId;

            const { error: idError } = mongooseIdDto.validate({
                id: teacherId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const teacher = await teacherService.getById(teacherId);

            res.status(200).json(teacher);
        })
    );

    router.put(
        "/:teacherId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const teacherId = req.params.teacherId;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({
                id: teacherId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = editTeacherDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const teacher = await teacherService.edit(teacherId, data);

            res.status(201).json(teacher);
        })
    );

    return router;
}
