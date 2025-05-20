import { Router } from "express";

import { classController } from "../../controllers/classBook/clssController.js";
import { classService } from "../../services/classBook/clssService.js";

const router = Router();

router.use("/", classController(classService));

export default router;
