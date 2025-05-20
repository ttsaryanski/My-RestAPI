import { Router } from "express";

import { commentController } from "../../controllers/gamesPlay/commentController.js";
import { commentService } from "../../services/gamesPlay/commentService.js";

const router = Router();

router.use("/", commentController(commentService));

export default router;
