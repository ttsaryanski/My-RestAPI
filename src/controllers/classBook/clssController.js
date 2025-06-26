import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { classDto } from "../../validators/classBook/classDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

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
            const userId = req.user._id;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = classDto.validate(req.body);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const item = await classService.create(data, userId);

            res.status(201).json(item);
        })
    );

    router.get(
        "/:clssId",
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            const { error: idError } = mongooseIdDto.validate({ id: clssId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const clss = await classService.getById(clssId);

            res.status(200).json(clss);
        })
    );

    router.get(
        "/:clssId/populate",
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            const { error: idError } = mongooseIdDto.validate({ id: clssId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const clss = await classService.getByIdPopulate(clssId);

            res.status(200).json(clss);
        })
    );

    router.put(
        "/:clssId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({ id: clssId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = classDto.validate(req.body);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const clss = await classService.edit(clssId, data);

            res.status(201).json(clss);
        })
    );

    router.delete(
        "/:clssId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const clssId = req.params.clssId;

            const { error: idError } = mongooseIdDto.validate({ id: clssId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            await classService.remove(clssId);

            res.status(204).end();
        })
    );

    return router;
}
