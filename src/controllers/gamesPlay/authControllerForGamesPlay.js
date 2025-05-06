import { Router } from "express";

import authServiceForGamesPlay from "../../services/gamesPlay/authServiceForGamesPlay.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const accessToken = await authServiceForGamesPlay.register(
            email,
            password
        );

        res.status(200)
            .cookie("auth_GamesPlay", accessToken, {
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
        const accessToken = await authServiceForGamesPlay.login(
            email,
            password
        );

        res.status(200)
            .cookie("auth_GamesPlay", accessToken, {
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
    const token = req.cookies["auth_GamesPlay"]?.accessToken;

    try {
        await authServiceForGamesPlay.logout(token);
        res.status(204)
            .clearCookie("auth_GamesPlay", {
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
    const { _id: userId } = req.user;

    try {
        const user = await authServiceForGamesPlay.getUserById(userId);

        res.status(200).json(user).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.get("/admin", async (req, res) => {
    try {
        await authServiceForGamesPlay.updateRole();

        res.status(200).json({ message: "The update was successful." }).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

export default router;
