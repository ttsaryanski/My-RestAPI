import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { editTeacherDto } from "../../validators/classBook/teacherDto.js";

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

            const teacher = await teacherService.getById(teacherId);

            res.status(200).json(teacher);
        })
    );

    router.put(
        "/:teacherId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const { error } = editTeacherDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const teacherId = req.params.teacherId;
            const data = req.body;

            const teacher = await teacherService.edit(teacherId, data);

            res.status(201).json(teacher);
        })
    );

    return router;
}
