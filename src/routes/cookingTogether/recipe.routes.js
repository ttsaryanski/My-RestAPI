import { Router } from "express";

import recipeController from "../../controllers/cookingTogether/recipeController.js";

const router = Router();

router.use("/", recipeController);

export default router;
