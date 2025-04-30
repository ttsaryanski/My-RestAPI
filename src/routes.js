import { Router } from "express";

import authControllerAngular from "./controllers/authControllerAngular.js";
import itemController from "./controllers/itemController.js";

import authController from "./controllers/authController.js";
import directorController from "./controllers/directorController.js";
import clssController from "./controllers/clssController.js";
import studentController from "./controllers/studentController.js";
import teacherController from "./controllers/teacherController.js";

import gameController from "./controllers/gameController.js";
import authGameController from "./controllers/authControllerForGamesPlay.js";

const routes = Router();

routes.use("/coocking/authAngular", authControllerAngular);
routes.use("/coocking/item", itemController);

routes.use("/class/auth", authController);
routes.use("/class/director", directorController);
routes.use("/class/clss", clssController);
routes.use("/class/student", studentController);
routes.use("/class/teacher", teacherController);

routes.use("/games_play/games", gameController);
routes.use("/games_play/authGame", authGameController);

export default routes;
