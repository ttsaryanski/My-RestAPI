import { Router } from "express";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import s3 from "../../utils/AWS S3 client.js";
import upload from "../../utils/multerStorage.js";
import { getUserIdFromCookie } from "../../utils/getUserIdFromCookie.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { createErrorMsg } from "../../utils/errorUtil.js";
import { cookiesNames } from "../../config/constans.js";

export function authController(authService) {
    const router = Router();

    router.post(
        "/register",
        upload.single("profilePicture"),
        async (req, res) => {
            const {
                firstName,
                lastName,
                email,
                identifier,
                secretKey,
                password,
            } = req.body;
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
                const accessToken = await authService.register(
                    firstName,
                    lastName,
                    email,
                    identifier,
                    secretKey,
                    password,
                    profilePicture
                );

                res.status(200)
                    .cookie(cookiesNames.classBook, accessToken, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: true,
                    })
                    .send(accessToken.user)
                    .end();
            } catch (error) {
                if (
                    error.message ===
                    "A user with this email or identifier is already registered!"
                ) {
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
        }
    );

    router.post(
        "/login",
        asyncErrorHandler(async (req, res) => {
            const { email, password } = req.body;

            const accessToken = await authService.login(email, password);

            res.status(200)
                .cookie(cookiesNames.classBook, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .send(accessToken.user);
        })
    );

    router.post(
        "/logout",
        asyncErrorHandler(async (req, res) => {
            const token = req.cookies[cookiesNames.classBook]?.accessToken;

            await authService.logout(token);
            res.status(204)
                .clearCookie(cookiesNames.classBook, {
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
                cookiesNames.classBook
            );

            const user = await authService.getUserById(userId);

            res.status(200).json(user);
        })
    );

    router.put(
        "/profile",
        authMiddleware,
        upload.single("profilePicture"),
        asyncErrorHandler(async (req, res) => {
            const userId = getUserIdFromCookie(req, cookiesNames.classBook);
            let data = req.body;

            if (req.file) {
                const filePath = req.file.path;

                const uploadParams = {
                    Bucket: "class-book",
                    Key: path.basename(filePath),
                    Body: fs.createReadStream(filePath),
                };

                const command = new PutObjectCommand(uploadParams);
                const s3Response = await s3.send(command);

                const fileName = req.file.originalname;
                const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
                data.profilePicture = { fileName, fileUrl };

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            const user = await authService.editUser(userId, data);

            res.status(201).json(user);
        })
    );

    return router;
}
