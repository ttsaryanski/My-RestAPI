import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import { getUserIdFromCookie } from "../../utils/getUserIdFromCookie.js";
import { cookiesNames } from "../../config/constans.js";

export function authController(authService) {
    const router = Router();

    router.post("/register", async (req, res) => {
        const { email, password } = req.body;

        try {
            const accessToken = await authService.register(email, password);

            res.status(200)
                .cookie(cookiesNames.gamesPlay, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .send(accessToken.user)
                .end();
        } catch (error) {
            if (error.message === "This email already registered!") {
                res.status(409)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else if (error.message.includes("validation")) {
                res.status(400)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else {
                res.status(500)
                    .json({ message: createErrorMsg(error) })
                    .end();
            }
        }
    });

    router.post("/login", async (req, res) => {
        const { email, password } = req.body;

        try {
            const accessToken = await authService.login(email, password);

            res.status(200)
                .cookie(cookiesNames.gamesPlay, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .send(accessToken.user)
                .end();
        } catch (error) {
            if (error.message === "User does not exist!") {
                res.status(404)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else if (error.message === "Password does not match!") {
                res.status(401)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else if (error.message.includes("validation")) {
                res.status(400)
                    .json({ message: createErrorMsg(error) })
                    .end();
            } else {
                res.status(500)
                    .json({ message: createErrorMsg(error) })
                    .end();
            }
        }
    });

    router.post("/logout", async (req, res) => {
        const token = req.cookies[cookiesNames.gamesPlay]?.accessToken;

        try {
            await authService.logout(token);
            res.status(204)
                .clearCookie(cookiesNames.gamesPlay, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .end();
        } catch (error) {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    });

    router.get("/profile", authMiddleware, async (req, res) => {
        const userId = await getUserIdFromCookie(req, cookiesNames.gamesPlay);

        try {
            const user = await authService.getUserById(userId);

            res.status(200).json(user).end();
        } catch (error) {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    });

    router.get("/updateRole", async (req, res) => {
        try {
            await authService.updateRole();

            res.status(200)
                .json({ message: "The update was successful." })
                .end();
        } catch (error) {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    });

    return router;
}
