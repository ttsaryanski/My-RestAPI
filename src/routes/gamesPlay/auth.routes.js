import { Router } from "express";

import { authController } from "../../controllers/gamesPlay/authControllerForGamesPlay.js";
import { authService } from "../../services/gamesPlay/authServiceForGamesPlay.js";

const router = Router();

router.use("/", authController(authService));

export default router;
