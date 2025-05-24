import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isAdmin } from "../../middlewares/isAdminMiddleware.js";

import { adminController } from "../../controllers/gamesPlay/adminController.js";
import { authService } from "../../services/gamesPlay/authServiceForGamesPlay.js";
import { gameService } from "../../services/gamesPlay/gameService.js";
import { visitService } from "../../services/gamesPlay/visitService.js";

const router = Router();

router.use(
    "/",
    authMiddleware,
    isAdmin,
    adminController(authService, gameService, visitService)
);

export default router;
