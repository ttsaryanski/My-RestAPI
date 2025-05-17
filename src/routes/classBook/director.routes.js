import { Router } from "express";

import directorController from "../../controllers/classBook/directorController.js";

const router = Router();

router.use("/", directorController);

export default router;
