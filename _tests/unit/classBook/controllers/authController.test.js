import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";

import { authController } from "../../../../src/controllers/classBook/authController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import InvalidToken from "../../../../src/models/InvalidToken.js";
import { cookiesNames, validId } from "../../../../src/config/constans.js";

import path from "path";
import s3 from "../../../../src/utils/awsUtils/AWS S3 client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ECDH } from "crypto";

jest.mock("../../../../src/utils/awsUtils/AWS S3 client.js", () => ({
    __esModule: true,
    default: {
        send: jest.fn(),
    },
}));

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

jest.mock("../../../../src/models/InvalidToken", () => ({
    create: jest.fn(),
}));

const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn(),
    editUser: jest.fn(),
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authController(mockAuthService));
app.use(errorHandler);

const mockUser = {
    _id: "64b2f9d4f8a1e4e1c5a9c123",
    email: "test@example.com",
};

const validCredentialsLogin = {
    email: "test@example.com",
    password: "123456",
};

const validStudentCredentialsRegister = {
    firstName: "userfirstname",
    lastName: "userlastname",
    email: "test@example.com",
    identifier: "0123456789",
    secretKey: undefined,
    password: "123456",
};

const validTeacherCredentialsRegister = {
    firstName: "userfirstname",
    lastName: "userlastname",
    email: "test@example.com",
    identifier: undefined,
    secretKey: "VALID_TEACHER_KEY",
    password: "123456",
};

describe("Auth Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /register - should register student and set cookie", async () => {
        mockAuthService.register.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/auth/register")
            .send(validStudentCredentialsRegister);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${cookiesNames.classBook}=mockToken`),
            ])
        );
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validStudentCredentialsRegister.firstName,
            validStudentCredentialsRegister.lastName,
            validStudentCredentialsRegister.email,
            validStudentCredentialsRegister.identifier,
            validStudentCredentialsRegister.secretKey,
            validStudentCredentialsRegister.password,
            null
        );
    });

    test("POST /register - should register teacher and set cookie", async () => {
        mockAuthService.register.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/auth/register")
            .send(validTeacherCredentialsRegister);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${cookiesNames.classBook}=mockToken`),
            ])
        );
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validTeacherCredentialsRegister.firstName,
            validTeacherCredentialsRegister.lastName,
            validTeacherCredentialsRegister.email,
            validTeacherCredentialsRegister.identifier,
            validTeacherCredentialsRegister.secretKey,
            validTeacherCredentialsRegister.password,
            null
        );
    });

    test("POST /register - should return 400 on invalid student data", async () => {
        const res = await request(app).post("/auth/register").send({
            firstName: "a",
            lastName: "invalid",
            email: "invalid",
            identifier: "123",
            secretKey: undefined,
            password: "1",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "First name should be at least 3 characters long"
        );
    });

    test("POST /register - should return 400 on invalid teacher data", async () => {
        const res = await request(app).post("/auth/register").send({
            firstName: "firstName",
            lastName: "lastname",
            email: "test@example.com",
            identifier: undefined,
            secretKey: 123,
            password: "123456",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch("Secret key must be a string");
    });

    test("POST /register - should return 500 if authService.register throws", async () => {
        mockAuthService.register.mockRejectedValue(
            new Error("Unexpected failure")
        );

        const res = await request(app)
            .post("/auth/register")
            .send(validStudentCredentialsRegister);

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected/i);
    });

    test("POST /register - with profile picture should upload and register", async () => {
        mockAuthService.register.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/auth/register")
            .field("firstName", validStudentCredentialsRegister.firstName)
            .field("lastName", validStudentCredentialsRegister.lastName)
            .field("email", validStudentCredentialsRegister.email)
            .field("identifier", validStudentCredentialsRegister.identifier)
            .field("password", validStudentCredentialsRegister.password)
            .attach("profilePicture", Buffer.from("mockImage"), "test.png");

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validStudentCredentialsRegister.firstName,
            validStudentCredentialsRegister.lastName,
            validStudentCredentialsRegister.email,
            validStudentCredentialsRegister.identifier,
            undefined,
            validStudentCredentialsRegister.password,
            expect.objectContaining({
                fileName: expect.any(String),
                fileUrl: expect.any(String),
            })
        );
    });

    test("POST /login - should login user and set cookie", async () => {
        mockAuthService.login.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/auth/login")
            .send(validCredentialsLogin);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${cookiesNames.classBook}=mockToken`),
            ])
        );
        expect(mockAuthService.login).toHaveBeenCalledWith(
            validCredentialsLogin.email,
            validCredentialsLogin.password
        );
    });

    test("POST /login - should return 400 on invalid data", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "invalid",
            password: "1",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/email/i);
    });

    test("POST /logout - should clear cookie", async () => {
        const fakeToken = "test-token";
        const cookieValue = encodeURIComponent(
            `j:${JSON.stringify({ accessToken: fakeToken })}`
        );

        mockAuthService.logout.mockImplementation(async (token) => {
            await InvalidToken.create({ token });
        });

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", [`${cookiesNames.classBook}=${cookieValue}`]);

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.logout).toHaveBeenCalledWith(fakeToken);
        expect(InvalidToken.create).toHaveBeenCalledWith({ token: fakeToken });
    });

    test("POST /logout - should return 401 missing token", async () => {
        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", [`${cookiesNames.classBook}='undefined'`]);
        console.log(res.body.message);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });

    test("GET /profile - should return user data", async () => {
        mockAuthService.getUserById.mockResolvedValue(mockUser);

        const res = await request(app).get("/auth/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockUser);
        expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser._id);
    });

    test("PUT /profile - should edit profile", async () => {
        const updatedProfile = {
            firstName: "userfirstname",
            lastName: "userlastname",
        };
        mockAuthService.editUser.mockResolvedValue(updatedProfile);

        const res = await request(app)
            .put("/auth/profile")
            .send(updatedProfile);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(updatedProfile);
        expect(mockAuthService.editUser).toHaveBeenCalledWith(
            validId,
            updatedProfile
        );
    });

    test("PUT /profile - should return 400 for invalid update data", async () => {
        const invalidUpdate = {
            firstName: "AB",
            lastName: "sh",
        };

        const res = await request(app).put("/auth/profile").send(invalidUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("should upload file to S3 and edit user", async () => {
        s3.send.mockResolvedValue({ ETag: '"mock-etag"' });
        mockAuthService.editUser.mockResolvedValue("mockToken");

        const filePath = path.join(__dirname, "../../test-image.jpg");
        const res = await request(app)
            .put("/auth/profile")
            .field("firstName", "TestUser")
            .field("lastName", "TestUser")
            .attach("profilePicture", filePath);

        expect(res.statusCode).toBe(201);
        expect(s3.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
        expect(mockAuthService.editUser).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                firstName: "TestUser",
                lastName: "TestUser",
                profilePicture: expect.objectContaining({
                    fileName: "test-image.jpg",
                    fileUrl: expect.stringContaining("s3.amazonaws.com/"),
                }),
            })
        );
    });
});
