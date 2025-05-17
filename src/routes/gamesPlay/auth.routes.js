import { Router } from "express";

import authController from "../../controllers/gamesPlay/authControllerForGamesPlay.js";

const router = Router();

router.use("/", authController);

export default router;
