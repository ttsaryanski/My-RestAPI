import { Router } from "express";

import commentController from "../../controllers/gamesPlay/commentController.js";

const router = Router();

router.use("/", commentController);

export default router;
