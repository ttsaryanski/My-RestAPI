import { Router } from "express";

import teacherService from "../services/teacherService.js";

import { createErrorMsg } from "../utils/errorUtil.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", async (req, res) => {
    const query = req.query;

    try {
        const teachers = await teacherService.getAll(query);

        res.status(200).json(teachers).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.get("/:teacherId", async (req, res) => {
    const teacherId = req.params.teacherId;

    try {
        const teacher = await teacherService.getById(teacherId);

        if (teacher !== null) {
            res.status(200).json(teacher).end();
        } else {
            res.status(404)
                .json({ message: "There is no item with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.put("/:teacherId", async (req, res) => {
    const teacherId = req.params.teacherId;
    const data = req.body;

    try {
        const teacher = await teacherService.edit(teacherId, data);

        res.status(201).json(teacher).end();
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

export default router;
