import { Router } from "express";

import authController from "../../controllers/classBook/authController.js";

const router = Router();

router.use("/", authController);

export default router;
