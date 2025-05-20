import { Router } from "express";

import { studentController } from "../../controllers/classBook/studentController.js";
import { studentService } from "../../services/classBook/studentService.js";

const router = Router();

router.use("/", studentController(studentService));

export default router;
