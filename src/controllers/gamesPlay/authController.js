import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { userDto } from "../../validators/gamesPlay/userDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";
import { loginLimiter } from "../../utils/rateLimiter.js";
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
        loginLimiter,
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
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const token =
                typeof req.cookies[cookiesNames.gamesPlay] === "string"
                    ? req.cookies[cookiesNames.gamesPlay] === "undefined"
                        ? undefined
                        : req.cookies[cookiesNames.gamesPlay]
                    : req.cookies[cookiesNames.gamesPlay]?.accessToken;

            if (!token) {
                throw new CustomError("Missing token in cookies!", 401);
            }

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
            const userId = req.user._id;

            const user = await authService.getUserById(userId);

            res.status(200).json(user);
        })
    );

    // TODO: This route was used for migration, it is preserved as part of history!
    router.patch(
        "/updateRole",
        asyncErrorHandler(async (req, res) => {
            await authService.updateRole();

            res.status(200).json({ message: "The update was successful." });
        })
    );

    return router;
}
