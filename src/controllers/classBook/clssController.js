import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { classDto } from "../../validators/classBook/classDto.js";

import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { CustomError } from "../../utils/customError.js";

export function classController(classService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const classes = await classService.getAll(query);

            res.status(200).json(classes);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const { error } = classDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const userId = req.user._id;
            const data = req.body;

            const item = await classService.create(data, userId);

            res.status(201).json(item);
        })
    );

    router.get(
        "/:clssId",
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            const clss = await classService.getById(clssId);

            res.status(200).json(clss);
        })
    );

    router.get(
        "/:clssId/populate",
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            const clss = await classService.getByIdPopulate(clssId);

            res.status(200).json(clss);
        })
    );

    router.put(
        "/:clssId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const { error } = classDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const clssId = req.params.clssId;
            const data = req.body;

            const clss = await classService.edit(clssId, data);

            res.status(201).json(clss);
        })
    );

    router.delete(
        "/:clssId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            await classService.remove(clssId);

            res.status(204).end();
        })
    );

    return router;
}
