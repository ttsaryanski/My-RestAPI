import { Router } from "express";

import { secretsDto } from "../../validators/classBook/secretDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

// TODO: This rout was used during the initial configuration and is not used in the application!!!
export function directorController(directorService) {
    const router = Router();

    router.post(
        "/",
        asyncErrorHandler(async (req, res) => {
            const { error } = secretsDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

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
