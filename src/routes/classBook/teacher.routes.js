import { Router } from "express";

import teacherController from "../../controllers/classBook/teacherController.js";

const router = Router();

router.use("/", teacherController);

export default router;
