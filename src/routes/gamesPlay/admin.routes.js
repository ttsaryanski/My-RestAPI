import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isAdmin } from "../../middlewares/isAdminMiddleware.js";

import adminController from "../../controllers/gamesPlay/adminController.js";

const router = Router();

router.use("/", authMiddleware, isAdmin, adminController);

export default router;
