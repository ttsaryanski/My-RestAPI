import { Router } from "express";

import classController from "../../controllers/classBook/clssController.js";

const router = Router();

router.use("/", classController);

export default router;
