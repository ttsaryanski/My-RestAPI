import { Router } from "express";

import { authController } from "../../controllers/gamesPlay/authController.js";
import { authService } from "../../services/gamesPlay/authService.js";

const router = Router();

router.use("/", authController(authService));

export default router;
