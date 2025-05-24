import { Router } from "express";

import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";

export function visitController(visitService) {
    const router = Router();

    router.post(
        "/",
        asyncErrorHandler(async (req, res) => {
            const page = req.body.page || "home";
            const ip = req.realIp;

            const count = await visitService.create(page, ip);

            res.status(201).json({ count });
        })
    );

    return router;
}
