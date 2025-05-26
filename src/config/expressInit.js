import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import csurf from "csurf";

import { realIp } from "../middlewares/realIp.js";
import { requestLogger } from "../middlewares/requestLogger.js";
import morgan from "morgan";

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = [
    "https://classbook-react-project.web.app",
    "https://cooking-together-782b1.web.app",
    "https://gamesplay-54b41.web.app",
];

if (isDev) {
    allowedOrigins.push(
        "http://localhost:4200",
        "http://localhost:5173",
        "http://localhost:4173"
    );
}

export default function expressInit(app) {
    app.set("trust proxy", true);

    // app.use(requestLogger);
    // app.use(morgan("dev"));
    app.use(realIp);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    );
    app.use(
        csurf({
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite:
                    process.env.NODE_ENV === "production" ? "None" : "Lax",
            },
        })
    );

    app.get("/api/csrf-token", (req, res) => {
        res.json({ csrfToken: req.csrfToken() });
    });

    app.use((err, req, res, next) => {
        if (err.code === "EBADCSRFTOKEN") {
            return res.status(403).json({ error: "Invalid CSRF token" });
        }
        next(err);
    });
}
