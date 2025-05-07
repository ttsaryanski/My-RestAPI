import { Router } from "express";

import clssService from "../../services/classBook/clssService.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Clss from "../../models/classBook/Clss.js";

const router = Router();

router.get("/", async (req, res) => {
    const query = req.query;

    try {
        const classes = await clssService.getAll(query);

        res.status(200).json(classes).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.post("/", authMiddleware, async (req, res) => {
    const userId = req.user._id;
    const data = req.body;

    try {
        const item = await clssService.create(data, userId);

        res.status(201).json(item).end();
    } catch (error) {
        if (error.message.includes("validation")) {
            res.status(400)
                .json({ message: createErrorMsg(error) })
                .end();
        } else if (error.message === "Missing or invalid data!") {
            res.status(400)
                .json({ message: createErrorMsg(error) })
                .end();
        } else {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    }
});

router.get("/:clssId", async (req, res) => {
    const clssId = req.params.clssId;

    try {
        const clss = await clssService.getById(clssId);

        if (clss !== null) {
            res.status(200).json(clss).end();
        } else {
            res.status(404)
                .json({ message: "There is no class with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/:clssId/populate", async (req, res) => {
    const clssId = req.params.clssId;

    try {
        const clss = await clssService.getByIdPopulate(clssId);

        if (clss !== null) {
            res.status(200).json(clss).end();
        } else {
            res.status(404)
                .json({ message: "There is no item with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.put("/:clssId", authMiddleware, async (req, res) => {
    const clssId = req.params.clssId;
    const data = req.body;

    try {
        const clss = await clssService.edit(clssId, data);

        res.status(201).json(clss).end();
    } catch (error) {
        if (error.message.includes("validation")) {
            res.status(400).json({ message: createErrorMsg(error) });
        } else if (error.message === "Missing or invalid data!") {
            res.status(400).json({ message: createErrorMsg(error) });
        } else {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    }
});

router.delete("/:clssId", authMiddleware, async (req, res) => {
    const clssId = req.params.clssId;

    try {
        await clssService.remove(clssId);

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

export default router;
