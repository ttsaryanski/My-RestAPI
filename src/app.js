import express from "express";
import dotenv from "dotenv";
dotenv.config();

import expressInit from "./config/expressInit.js";
import routes from "./routes/routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
expressInit(app);

app.use("/api", routes);
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next(err);
});
app.use(errorHandler);

export default app;
