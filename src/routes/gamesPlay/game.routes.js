import { Router } from "express";

import gameController from "../../controllers/gamesPlay/gameController.js";

const router = Router();

router.use("/", gameController);

export default router;
