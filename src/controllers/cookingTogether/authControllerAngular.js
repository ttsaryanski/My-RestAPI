import { Router } from "express";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import {
    userRegisterDto,
    userLoginDto,
} from "../../validators/cookingTogether/userDto.js";

import s3 from "../../utils/awsUtils/AWS S3 client.js";
import upload from "../../utils/awsUtils/multerStorage.js";
import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";
import { loginLimiter } from "../../utils/rateLimiter.js";
import { cookiesNames } from "../../config/constans.js";

export function authController(authService) {
    const router = Router();

    router.post(
        "/register",
        upload.single("profilePicture"),
        asyncErrorHandler(async (req, res) => {
            const data = req.body;

            const { error: dataError } = userRegisterDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const { username, email, password, rePassword } = data;
            let profilePicture = null;

            // if (req.file) {
            // const filePath = req.file.path;

            // const uploadParams = {
            // Bucket: "test-client-bucket-app",
            // Key: path.basename(filePath),
            // Body: fs.createReadStream(filePath),
            // };

            // const command = new PutObjectCommand(uploadParams);
            // const s3Response = await s3.send(command);

            // const fileName = req.file.originalname;
            // const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
            // profilePicture = { fileName, fileUrl };

            // if (fs.existsSync(filePath)) {
            // fs.unlinkSync(filePath);
            // }
            // }

            if (req.file) {
                const uploadParams = {
                    Bucket: "test-client-bucket-app",
                    Key: `${Date.now()}-${req.file.originalname}`,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };
                const command = new PutObjectCommand(uploadParams);
                const s3Response = await s3.send(command);
                const fileName = req.file.originalname;
                const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
                profilePicture = { fileName, fileUrl };
            }

            const accessToken = await authService.register(
                username,
                email,
                password,
                profilePicture
            );

            res.status(204)
                .cookie(cookiesNames.cookingTogether, accessToken, {
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
            const { error } = userLoginDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const { email, password } = req.body;

            const accessToken = await authService.login(email, password);

            res.status(204)
                .cookie(cookiesNames.cookingTogether, accessToken, {
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
            const token =
                typeof req.cookies[cookiesNames.cookingTogether] === "string"
                    ? req.cookies[cookiesNames.cookingTogether] === "undefined"
                        ? undefined
                        : req.cookies[cookiesNames.cookingTogether]
                    : req.cookies[cookiesNames.cookingTogether]?.accessToken;

            if (!token) {
                throw new CustomError("Missing token in cookies!", 401);
            }

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
            const userId = req.user._id;

            const user = await authService.getUserById(userId);

            res.status(200).json(user);
        })
    );

    return router;
}
