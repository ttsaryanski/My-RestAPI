import { Router } from "express";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import authServiceAngular from "../services/authServiceAngular.js";

import s3 from "../utils/AWS S3 client.js";
import upload from "../utils/multerStorage.js";
import { createErrorMsg } from "../utils/errorUtil.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", upload.single("profilePicture"), async (req, res) => {
    const { username, email, password, rePassword } = req.body;
    let profilePicture = null;

    if (req.file) {
        const filePath = req.file.path;

        const uploadParams = {
            Bucket: "test-client-bucket-app",
            Key: path.basename(filePath),
            Body: fs.createReadStream(filePath),
        };

        const command = new PutObjectCommand(uploadParams);
        const s3Response = await s3.send(command);

        const fileName = req.file.originalname;
        const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
        profilePicture = { fileName, fileUrl };

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    try {
        const accessToken = await authServiceAngular.register(
            username,
            email,
            password,
            profilePicture
        );

        res.status(200)
            .cookie("auth", accessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
            })
            .send(accessToken.user)
            .end();
    } catch (error) {
        if (error.message === "This username or email already registered!") {
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
        const accessToken = await authServiceAngular.login(email, password);

        res.status(200)
            .cookie("auth", accessToken, {
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
    const token = req.cookies["auth"]?.accessToken;

    try {
        await authServiceAngular.logout(token);
        res.status(204)
            .clearCookie("auth", {
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
        const user = await authServiceAngular.getUserById(userId);

        res.status(200).json(user).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

export default router;
