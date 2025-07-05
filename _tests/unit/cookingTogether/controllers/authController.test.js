import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";

import { authController } from "../../../../src/controllers/cookingTogether/authControllerAngular.js";

import errorHandler from "../../../../src/middlewares/errorHandler.js";

import InvalidToken from "../../../../src/models/InvalidToken.js";
import { cookiesNames } from "../../../../src/config/constans.js";

import path from "path";
import s3 from "../../../../src/utils/awsUtils/AWS S3 client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/authAngular", authController(mockAuthService));
app.use(errorHandler);

const mockUser = {
    _id: "64b2f9d4f8a1e4e1c5a9c123",
    email: "test@example.com",
};

const validCredentialsRegister = {
    email: "test@example.com",
    username: "username",
    password: "123456",
    rePassword: "123456",
};

const validCredentialsLogin = {
    email: "test@example.com",
    password: "123456",
};

describe("Auth Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /register - should register user and set cookie", async () => {
        mockAuthService.register.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/authAngular/register")
            .send(validCredentialsRegister);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(
                    `${cookiesNames.cookingTogether}=mockToken`
                ),
            ])
        );
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validCredentialsRegister.username,
            validCredentialsRegister.email,
            validCredentialsRegister.password,
            null
        );
    });

    test("POST /register - should return 400 on invalid data", async () => {
        const res = await request(app).post("/authAngular/register").send({
            username: "a",
            email: "invalid",
            password: "1",
            rePassword: "2",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Username must be at least 3 characters!"
        );
    });

    test("POST /register - should return 500 if authService.register throws", async () => {
        mockAuthService.register.mockRejectedValue(
            new Error("Unexpected failure")
        );

        const res = await request(app)
            .post("/authAngular/register")
            .send(validCredentialsRegister);

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected/i);
    });

    test("POST /register - with profile picture should upload and register", async () => {
        mockAuthService.register.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/authAngular/register")
            .field("username", validCredentialsRegister.username)
            .field("email", validCredentialsRegister.email)
            .field("password", validCredentialsRegister.password)
            .field("rePassword", validCredentialsRegister.rePassword)
            .attach("profilePicture", Buffer.from("mockImage"), "test.png");

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validCredentialsRegister.username,
            validCredentialsRegister.email,
            validCredentialsRegister.password,
            expect.objectContaining({
                fileName: expect.any(String),
                fileUrl: expect.any(String),
            })
        );
    });

    test("POST /login - should login user and set cookie", async () => {
        mockAuthService.login.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/authAngular/login")
            .send(validCredentialsLogin);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(
                    `${cookiesNames.cookingTogether}=mockToken`
                ),
            ])
        );
        expect(mockAuthService.login).toHaveBeenCalledWith(
            validCredentialsLogin.email,
            validCredentialsLogin.password
        );
    });

    test("POST /login - should return 400 on invalid data", async () => {
        const res = await request(app).post("/authAngular/login").send({
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
            .post("/authAngular/logout")
            .set("Cookie", [`${cookiesNames.cookingTogether}=${cookieValue}`]);

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.logout).toHaveBeenCalledWith(fakeToken);
        expect(InvalidToken.create).toHaveBeenCalledWith({ token: fakeToken });
    });

    test("POST /logout - should return 401 missing token", async () => {
        const res = await request(app)
            .post("/authAngular/logout")
            .set("Cookie", [`${cookiesNames.cookingTogether}=undefined`]);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });

    test("GET /profile - should return user data", async () => {
        mockAuthService.getUserById.mockResolvedValue(mockUser);

        const res = await request(app).get("/authAngular/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockUser);
        expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser._id);
    });

    test("should upload file to S3 and register user", async () => {
        s3.send.mockResolvedValue({ ETag: '"mock-etag"' });
        mockAuthService.register.mockResolvedValue("mockToken");

        const filePath = path.join(__dirname, "../../test-image.jpg");
        const res = await request(app)
            .post("/authAngular/register")
            .field("username", "TestUser")
            .field("email", "test@example.com")
            .field("password", "123456")
            .field("rePassword", "123456")
            .attach("profilePicture", filePath);

        expect(res.statusCode).toBe(204);
        expect(s3.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
        expect(mockAuthService.register).toHaveBeenCalledWith(
            "TestUser",
            "test@example.com",
            "123456",
            expect.objectContaining({
                fileName: "test-image.jpg",
                fileUrl: expect.stringContaining("s3.amazonaws.com/"),
            })
        );
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(
                    `${cookiesNames.cookingTogether}=mockToken`
                ),
            ])
        );
    });
});
