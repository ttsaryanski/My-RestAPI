import { Router } from "express";

import directorController from "./controllers/directorController.js";
import authController from "./controllers/authController.js";
import itemController from "./controllers/itemController.js";
import clssController from "./controllers/clssController.js";
import studentController from "./controllers/studentController.js";
import teacherController from "./controllers/teacherController.js";

const routes = Router();

routes.use("/director", directorController);
routes.use("/auth", authController);
routes.use("/item", itemController);
routes.use("/clss", clssController);
routes.use("/student", studentController);
routes.use("/teacher", teacherController);

export default routes;
