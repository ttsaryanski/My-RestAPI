import { Router } from "express";

import { directorController } from "../../controllers/classBook/directorController.js";
import { directorService } from "../../services/classBook/directorService.js";

const router = Router();

router.use("/", directorController(directorService));

export default router;
