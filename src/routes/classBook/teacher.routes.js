import { Router } from "express";

import { teacherController } from "../../controllers/classBook/teacherController.js";
import { teacherService } from "../../services/classBook/teacherService.js";

const router = Router();

router.use("/", teacherController(teacherService));

export default router;
