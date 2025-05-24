import { Router } from "express";

import authCookingRoutes from "./cookingTogether/auth.routes.js";
import recipeCookingRoutes from "./cookingTogether/recipe.routes.js";

import authClassBookRoutes from "./classBook/auth.routes.js";
import directorClassBookRoutes from "./classBook/director.routes.js";
import classClassBookRoutes from "./classBook/class.routes.js";
import teacherClassBookRoutes from "./classBook/teacher.routes.js";
import studentClassBookRoutes from "./classBook/student.routes.js";

import adminGamesPlayRoutes from "./gamesPlay/admin.routes.js";
import authGamesPlayRoutes from "./gamesPlay/auth.routes.js";
import gameGamesPlayRoutes from "./gamesPlay/game.routes.js";
import commentGamesPlayRoutes from "./gamesPlay/comment.routes.js";
import visitGamesPlayRoutes from "./gamesPlay/visit.routes.js";

const routes = Router();

routes.use("/coocking/authAngular", authCookingRoutes);
routes.use("/coocking/recipes", recipeCookingRoutes);

routes.use("/class/auth", authClassBookRoutes);
routes.use("/class/director", directorClassBookRoutes);
routes.use("/class/clss", classClassBookRoutes);
routes.use("/class/teacher", teacherClassBookRoutes);
routes.use("/class/student", studentClassBookRoutes);

routes.use("/games_play/admin", adminGamesPlayRoutes);
routes.use("/games_play/authGame", authGamesPlayRoutes);
routes.use("/games_play/games", gameGamesPlayRoutes);
routes.use("/games_play/comments", commentGamesPlayRoutes);
routes.use("/games_play/visit", visitGamesPlayRoutes);

export default routes;
