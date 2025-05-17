import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { PORT } from "./config/constans.js";

import expressInit from "./config/expressInit.js";
import mongooseInit from "./config/mongooseInit.js";

import routes from "./routes/routes.js";

const app = express();

mongooseInit();
expressInit(app);

app.use("/api", routes);

const port = process.env.PORT || PORT;
app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`)
);
