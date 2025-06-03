import { Router } from "express";

import { authController } from "../../controllers/cookingTogether/authControllerAngular.js";
import { authService } from "../../services/cookingTogether/authService.js";

const router = Router();

router.use("/", authController(authService));

export default router;
