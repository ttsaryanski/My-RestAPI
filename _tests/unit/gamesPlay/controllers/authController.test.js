import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";

import { authController } from "../../../../src/controllers/gamesPlay/authController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import InvalidToken from "../../../../src/models/InvalidToken.js";
import { cookiesNames } from "../../../../src/config/constans.js";

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
    updateRole: jest.fn(),
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/authGame", authController(mockAuthService));
app.use(errorHandler);

const mockUser = {
    _id: "64b2f9d4f8a1e4e1c5a9c123",
    email: "test@example.com",
    role: "user",
};

const validCredentials = {
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
            .post("/authGame/register")
            .send(validCredentials);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${cookiesNames.gamesPlay}=mockToken`),
            ])
        );
        expect(mockAuthService.register).toHaveBeenCalledWith(
            validCredentials.email,
            validCredentials.password
        );
    });

    test("POST /register - should return 400 on invalid data", async () => {
        const res = await request(app).post("/authGame/register").send({
            email: "invalid",
            password: "1",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/email/i);
    });

    test("POST /login - should login user and set cookie", async () => {
        mockAuthService.login.mockResolvedValue("mockToken");

        const res = await request(app)
            .post("/authGame/login")
            .send(validCredentials);

        expect(res.statusCode).toBe(204);
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${cookiesNames.gamesPlay}=mockToken`),
            ])
        );
        expect(mockAuthService.login).toHaveBeenCalledWith(
            validCredentials.email,
            validCredentials.password
        );
    });

    test("POST /login - should return 400 on invalid data", async () => {
        const res = await request(app).post("/authGame/login").send({
            email: "",
            password: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/email/i);
    });

    test("GET /profile - should return user data", async () => {
        mockAuthService.getUserById.mockResolvedValue(mockUser);

        const res = await request(app).get("/authGame/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockUser);
        expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser._id);
    });

    test("GET /updateRole - should update roles", async () => {
        mockAuthService.updateRole.mockResolvedValue();

        const res = await request(app).get("/authGame/updateRole");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "The update was successful." });
        expect(mockAuthService.updateRole).toHaveBeenCalled();
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
            .post("/authGame/logout")
            .set("Cookie", [`${cookiesNames.gamesPlay}=${cookieValue}`]);

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.logout).toHaveBeenCalledWith(fakeToken);
        expect(InvalidToken.create).toHaveBeenCalledWith({ token: fakeToken });
    });

    test("POST /logout - should return 401 missing token", async () => {
        const res = await request(app)
            .post("/authGame/logout")
            .set("Cookie", [`${cookiesNames.gamesPlay}='undefined'`]);
        console.log(res.body.message);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });
});
