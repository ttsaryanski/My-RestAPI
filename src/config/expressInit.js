import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authMiddleware } from "../middlewares/authMiddleware.js";

export default function expressInit(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(
        cors({
            origin: [
                "https://classbook-react-project.web.app",
                "https://test-client-hgl0.onrender.com",
            ],
            credentials: true,
        })
    );

    // app.use(authMiddleware);
}
