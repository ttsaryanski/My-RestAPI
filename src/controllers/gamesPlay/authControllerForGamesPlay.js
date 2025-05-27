import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { userDto } from "../../validators/gamesPlay/userDto.js";

import { getUserIdFromCookie } from "../../utils/getUserIdFromCookie.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { CustomError } from "../../utils/customError.js";
import { cookiesNames } from "../../config/constans.js";

export function authController(authService) {
    const router = Router();

    router.post(
        "/register",
        asyncErrorHandler(async (req, res) => {
            const { error } = userDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const { email, password } = req.body;

            const accessToken = await authService.register(email, password);

            res.status(204)
                .cookie(cookiesNames.gamesPlay, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .end();
        })
    );

    router.post(
        "/login",
        asyncErrorHandler(async (req, res) => {
            const { error } = userDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const { email, password } = req.body;

            const accessToken = await authService.login(email, password);

            res.status(204)
                .cookie(cookiesNames.gamesPlay, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .end();
        })
    );

    router.post(
        "/logout",
        asyncErrorHandler(async (req, res) => {
            const token = req.cookies[cookiesNames.gamesPlay]?.accessToken;

            await authService.logout(token);

            res.status(204)
                .clearCookie(cookiesNames.gamesPlay, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .end();
        })
    );

    router.get(
        "/profile",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = await getUserIdFromCookie(
                req,
                cookiesNames.gamesPlay
            );

            const user = await authService.getUserById(userId);

            res.status(200).json(user);
        })
    );

    router.get(
        "/updateRole",
        asyncErrorHandler(async (req, res) => {
            await authService.updateRole();

            res.status(200).json({ message: "The update was successful." });
        })
    );

    return router;
}
