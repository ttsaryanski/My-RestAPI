import { Router } from "express";

import { recipeController } from "../../controllers/cookingTogether/recipeController.js";
import { recipeService } from "../../services/cookingTogether/recipeService.js";

const router = Router();

router.use("/", recipeController(recipeService));

export default router;
