import { Router } from "express";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import {
    userRegisterDto,
    userLoginDto,
} from "../../validators/cookingTogether/userDto.js";

import s3 from "../../utils/AWS S3 client.js";
import upload from "../../utils/multerStorage.js";
import { getUserIdFromCookie } from "../../utils/getUserIdFromCookie.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { CustomError } from "../../utils/customError.js";
import { cookiesNames } from "../../config/constans.js";

export function authController(authService) {
    const router = Router();

    router.post(
        "/register",
        upload.single("profilePicture"),
        asyncErrorHandler(async (req, res) => {
            const { error } = userRegisterDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

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

            const accessToken = await authService.register(
                username,
                email,
                password,
                profilePicture
            );

            res.status(200)
                .cookie(cookiesNames.cookingTogether, accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                })
                .send(accessToken.user);
        })
    );

    router.post(
        "/login",
        asyncErrorHandler(async (req, res) => {
            const { error } = userLoginDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const { email, password } = req.body;

            const accessToken = await authService.login(email, password);

            res.status(200)
                .cookie(cookiesNames.cookingTogether, accessToken, {
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
            const token =
                req.cookies[cookiesNames.cookingTogether]?.accessToken;

            await authService.logout(token);
            res.status(204)
                .clearCookie(cookiesNames.cookingTogether, {
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
                cookiesNames.cookingTogether
            );

            const user = await authService.getUserById(userId);

            res.status(200).json(user);
        })
    );

    return router;
}
