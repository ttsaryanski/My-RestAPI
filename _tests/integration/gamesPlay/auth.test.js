jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: global.userId };
        req.isAuthenticated = true;
        next();
    },
}));

import request from "supertest";

import app from "../../../src/app.js";
import UserGames from "../../../src/models/gamesPlay/User.js";
import InvalidToken from "../../../src/models/InvalidToken.js";

import { validId } from "../../../src/config/constans.js";
import { cookiesNames } from "../../../src/config/constans.js";

import { createAccessToken } from "../../../src/services/gamesPlay/authService.js";

describe("POST /authGame/register", () => {
    beforeEach(async () => {
        await UserGames.deleteMany();

        await UserGames.create({
            email: "existuser@email.com",
            password: "password",
        });
    });

    it("should create new user and return 204", async () => {
        const newUser = {
            email: "user@email.com",
            password: "password",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/register")
            .send(newUser);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.gamesPlay + "=")
        );
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/Secure/);

        const dbEntry = await UserGames.findOne({ email: newUser.email });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 409 if user exist", async () => {
        const newUser = {
            email: "existuser@email.com",
            password: "password",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/register")
            .send(newUser);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("This email already registered!");
    });

    it("should return 400 if data is incorect", async () => {
        const incorectUser = {
            email: "incorectemail",
            password: "Pa",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/register")
            .send(incorectUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await UserGames.findOne({ email: incorectUser.email });
        expect(dbEntry).toBeNull();
    });
});

describe("POST /authGame/login", () => {
    const userData = {
        email: "testuser@example.com",
        password: "securePass123",
        role: "user",
    };

    beforeEach(async () => {
        await UserGames.deleteMany();

        await UserGames.create({
            email: userData.email,
            password: userData.password,
            role: userData.role,
        });
    });

    it("should login user and return 204", async () => {
        const loginData = {
            email: userData.email,
            password: userData.password,
        };

        const res = await request(app)
            .post("/api/games_play/authGame/login")
            .send(loginData);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.gamesPlay + "=")
        );
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/Secure/);
    });

    it("should return 400 if login data is incorect", async () => {
        const incorectUser = {
            email: "incorectemail",
            password: "Pa",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/login")
            .send(incorectUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if user not exist", async () => {
        const notExistingUser = {
            email: "thisUserNotExist@email.com",
            password: "Password",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/login")
            .send(notExistingUser);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User does not exist!");
    });

    it("should return 401 if password not match", async () => {
        const loginData = {
            email: userData.email,
            password: "incorectPassword",
        };

        const res = await request(app)
            .post("/api/games_play/authGame/login")
            .send(loginData);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Password does not match!");
    });
});

describe("POST /autGame/logout", () => {
    const userData = {
        email: "testlogout@example.com",
        password: "logoutPass123",
        role: "user",
    };

    let accessToken;
    beforeEach(async () => {
        await UserGames.deleteMany();
        await InvalidToken.deleteMany();

        const user = await UserGames.create({
            email: userData.email,
            password: userData.password,
        });

        const tokenData = await createAccessToken(user);
        accessToken = tokenData.accessToken;
    });

    test("should logout successfully and blacklist token", async () => {
        const res = await request(app)
            .post("/api/games_play/authGame/logout")
            .set(
                "Cookie",
                `${cookiesNames.gamesPlay}=${JSON.stringify(accessToken)}`
            )
            .send();

        expect(res.statusCode).toBe(204);

        const blacklisted = await InvalidToken.findOne({ token: accessToken });
        expect(blacklisted).not.toBeNull();

        const cookies = res.headers["set-cookie"];
        expect(
            cookies.some((c) => c.startsWith(`${cookiesNames.gamesPlay}=`))
        ).toBe(true);
        expect(
            cookies.find(
                (c) => c.includes("Max-Age=0") || c.includes("Expires=")
            )
        ).toBeDefined();
    });

    test("should fail if token is missing in cookie", async () => {
        const res = await request(app)
            .post("/api/games_play/authGame/logout")
            .send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });
});

describe("GET /authGame/profile", () => {
    beforeEach(async () => {
        await UserGames.deleteMany();
    });

    test("should return profile of logged-in user", async () => {
        const user = await UserGames.create({
            email: "profile@example.com",
            password: "password",
        });
        global.userId = user._id.toString();

        const res = await request(app).get("/api/games_play/authGame/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe("profile@example.com");
        expect(res.body.role).toBe("user");
    });

    test("should return 404 if user not exist", async () => {
        await UserGames.create({
            email: "profile@example.com",
            password: "password",
        });
        global.userId = validId;

        const res = await request(app).get("/api/games_play/authGame/profile");

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no user with this id!");
    });
});
