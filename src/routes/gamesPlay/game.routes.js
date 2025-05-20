import { Router } from "express";

import { gameController } from "../../controllers/gamesPlay/gameController.js";
import { gameService } from "../../services/gamesPlay/gameService.js";

const router = Router();

router.use("/", gameController(gameService));

export default router;
