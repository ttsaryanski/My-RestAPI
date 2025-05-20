import { Router } from "express";

import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";

export function directorController(directorService) {
    const router = Router();

    router.post(
        "/",
        asyncErrorHandler(async (req, res) => {
            const { teacherKey, directorKey } = req.body;

            const keys = await directorService.create({
                teacherKey,
                directorKey,
            });

            res.status(201).json(keys);
        })
    );

    return router;
}
