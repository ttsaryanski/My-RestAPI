import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { PORT } from "./config/constans.js";

import expressInit from "./config/expressInit.js";
import mongooseInit from "./config/mongooseInit.js";

import routes from "./routes/routes.js";
import errorHandler from "./middlewares/errorHandler.js";
const app = express();

mongooseInit();
expressInit(app);

app.use("/api", routes);
app.use((err, req, res, next) => {
    console.log("csre", err);

    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next(err);
});
app.use(errorHandler);

const port = process.env.PORT || PORT;
app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`)
);
