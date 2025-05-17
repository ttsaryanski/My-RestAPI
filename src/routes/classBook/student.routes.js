import { Router } from "express";

import studentController from "../../controllers/classBook/studentController.js";

const router = Router();

router.use("/", studentController);

export default router;
