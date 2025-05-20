import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";

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
            const teacherId = req.params.teacherId;
            const data = req.body;

            const teacher = await teacherService.edit(teacherId, data);

            res.status(201).json(teacher);
        })
    );

    return router;
}
