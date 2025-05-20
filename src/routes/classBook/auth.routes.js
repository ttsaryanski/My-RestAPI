import { Router } from "express";

import { authController } from "../../controllers/classBook/authController.js";
import { authService } from "../../services/classBook/authService.js";

const router = Router();

router.use("/", authController(authService));

export default router;
