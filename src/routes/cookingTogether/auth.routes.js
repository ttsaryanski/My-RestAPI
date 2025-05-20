import { Router } from "express";

import { authController } from "../../controllers/cookingTogether/authControllerAngular.js";
import { authService } from "../../services/cookingTogether/authServiceAngular.js";

const router = Router();

router.use("/", authController(authService));

export default router;
