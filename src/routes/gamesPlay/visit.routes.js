import { Router } from "express";

import { visitController } from "../../controllers/gamesPlay/visitController.js";
import { visitService } from "../../services/gamesPlay/visitService.js";

const router = Router();

router.use("/", visitController(visitService));

export default router;
