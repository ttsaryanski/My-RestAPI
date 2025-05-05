import { Router } from "express";

import directorService from "../../services/classBook/directorService.js";
import { createErrorMsg } from "../../utils/errorUtil.js";

const router = Router();

router.post("/", async (req, res) => {
    const { teacherKey, directorKey } = req.body;

    try {
        const keys = await directorService.create({ teacherKey, directorKey });

        res.json(keys).end();
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
