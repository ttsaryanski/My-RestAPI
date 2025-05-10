import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger } from "../middlewares/requestLogger.js";
import morgan from "morgan";

export default function expressInit(app) {
    // app.use(requestLogger);
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(
        cors({
            origin: [
                "https://classbook-react-project.web.app",
                "https://cooking-together-782b1.web.app",
                "https://gamesplay-54b41.web.app",
                "http://localhost:4200",
                "http://localhost:5173",
                "http://localhost:4173",
            ],
            credentials: true,
        })
    );
}
