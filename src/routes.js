import { Router } from "express";

import authControllerAngular from "./controllers/cookingTogether/authControllerAngular.js";
import itemController from "./controllers/cookingTogether/itemController.js";

import authController from "./controllers/classBook/authController.js";
import directorController from "./controllers/classBook/directorController.js";
import clssController from "./controllers/classBook/clssController.js";
import studentController from "./controllers/classBook/studentController.js";
import teacherController from "./controllers/classBook/teacherController.js";

import authGameController from "./controllers/gamesPlay/authControllerForGamesPlay.js";
import gameController from "./controllers/gamesPlay/gameController.js";
import commentController from "./controllers/gamesPlay/commentController.js";

const routes = Router();

routes.use("/coocking/authAngular", authControllerAngular);
routes.use("/coocking/item", itemController);

routes.use("/class/auth", authController);
routes.use("/class/director", directorController);
routes.use("/class/clss", clssController);
routes.use("/class/student", studentController);
routes.use("/class/teacher", teacherController);

routes.use("/games_play/authGame", authGameController);
routes.use("/games_play/games", gameController);
routes.use("/games_play/comments", commentController);

export default routes;
