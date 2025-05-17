import { Router } from "express";

import authController from "../../controllers/cookingTogether/authControllerAngular.js";

const router = Router();

router.use("/", authController);

export default router;
