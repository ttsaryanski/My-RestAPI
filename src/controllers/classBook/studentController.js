import { Router } from "express";

import studentService from "../../services/classBook/studentService.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", async (req, res) => {
    const query = req.query;

    try {
        const students = await studentService.getAll(query);

        res.status(200).json(students).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.post("/", async (req, res) => {
    const userId = await req.cookies?.auth?.user?._id;
    const data = req.body;

    try {
        const item = await studentService.create(data, userId);

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

router.post("/paginated", async (req, res) => {
    const query = req.body;

    try {
        const result = await studentService.getAllPaginated(query);
        const payload = {
            students: result.students,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        };

        res.status(200).json(payload).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/:studentId", async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const student = await studentService.getById(studentId);

        if (student !== null) {
            res.status(200).json(student).end();
        } else {
            res.status(404)
                .json({ message: "There is no student with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/:studentId/populate", async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const student = await studentService.getByIdPopulate(studentId);

        if (student !== null) {
            res.status(200).json(student).end();
        } else {
            res.status(404)
                .json({ message: "There is no student with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.put("/:studentId", authMiddleware, async (req, res) => {
    const studentId = req.params.studentId;
    const data = req.body;

    try {
        const student = await studentService.edit(studentId, data);

        res.status(201).json(student).end();
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
