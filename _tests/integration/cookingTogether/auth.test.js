jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: global.userId };
        req.isAuthenticated = true;
        next();
    },
}));

import request from "supertest";

import app from "../../../src/app.js";
import UserAngular from "../../../src/models/cookingTogether/User.js";
import InvalidToken from "../../../src/models/InvalidToken.js";

import s3 from "../../../src/utils/awsUtils/AWS S3 client.js";

import { validId } from "../../../src/config/constans.js";
import { cookiesNames } from "../../../src/config/constans.js";

import { createAccessToken } from "../../../src/services/cookingTogether/authService.js";

jest.mock("@aws-sdk/client-s3", () => {
    const sendMock = jest.fn().mockResolvedValue({ ETag: '"mocked-etag"' });
    return {
        S3Client: jest.fn(() => ({
            send: sendMock,
        })),
        PutObjectCommand: jest.fn(),
    };
});

describe("POST /authAngular/register", () => {
    beforeEach(async () => {
        await UserAngular.deleteMany();

        await UserAngular.create({
            username: "existuser",
            email: "existuser@email.com",
            password: "password",
        });

        jest.spyOn(s3, "send").mockResolvedValue({
            ETag: '"mocked-etag"',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should create new user and return 204", async () => {
        const newUser = {
            username: "user",
            email: "user@email.com",
            password: "password",
            rePassword: "password",
        };

        const res = await request(app)
            .post("/api/cooking/authAngular/register")
            .send(newUser);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.cookingTogether + "=")
        );
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/Secure/);

        const dbEntry = await UserAngular.findOne({ email: newUser.email });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 409 if user exist", async () => {
        const newUser = {
            username: "existuser",
            email: "existuser@email.com",
            password: "password",
            rePassword: "password",
        };

        const res = await request(app)
            .post("/api/cooking/authAngular/register")
            .send(newUser);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe(
            "This username or email already registered!"
        );
    });

    it("should return 400 if rePassword do not match", async () => {
        const newUser = {
            username: "user",
            email: "user@email.com",
            password: "password",
            rePassword: "rePassword",
        };

        const res = await request(app)
            .post("/api/cooking/authAngular/register")
            .send(newUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("rePasswords do not match");
    });

    it("should return 400 if data is incorect", async () => {
        const incorectUser = {
            username: "ex",
            email: "incorectemail",
            password: "Pa",
            rePassword: "Pa",
        };

        const res = await request(app)
            .post("/api/cooking/authAngular/register")
            .send(incorectUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await UserAngular.findOne({
            email: incorectUser.email,
        });
        expect(dbEntry).toBeNull();
    });

    it("should upload profile picture and create user with AWS mock", async () => {
        const res = await request(app)
            .post("/api/cooking/authAngular/register")
            .field("username", "fileuser")
            .field("email", "fileuser@email.com")
            .field("password", "password")
            .field("rePassword", "password")
            .attach("profilePicture", Buffer.from("mock image"), {
                filename: "test-image.jpg",
                contentType: "image/jpeg",
            });

        expect(res.statusCode).toBe(204);

        const user = await UserAngular.findOne({ email: "fileuser@email.com" });
        expect(user).not.toBeNull();

        expect(user.profilePicture).toBeDefined();
        expect(user.profilePicture.fileName).toBe("test-image.jpg");
        expect(user.profilePicture.fileUrl).toMatch(
            /^https:\/\/.*\.s3\.amazonaws\.com\/.*/
        );
    });
});

describe("POST /authAngular/login", () => {
    const userData = {
        username: "testuser",
        email: "testuser@example.com",
        password: "securePass123",
    };

    beforeEach(async () => {
        await UserAngular.deleteMany();

        await UserAngular.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
        });
    });

    it("should login user and return 204", async () => {
        const loginData = {
            email: userData.email,
            password: userData.password,
        };

        const res = await request(app)
            .post("/api/cooking/authAngular/login")
            .send(loginData);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.cookingTogether + "=")
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
            .post("/api/cooking/authAngular/login")
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
            .post("/api/cooking/authAngular/login")
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
            .post("/api/cooking/authAngular/login")
            .send(loginData);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Password does not match!");
    });
});

describe("POST /autAngular/logout", () => {
    const userData = {
        username: "testuser",
        email: "testuser@example.com",
        password: "securePass123",
    };

    let accessToken;
    beforeEach(async () => {
        await UserAngular.deleteMany();
        await InvalidToken.deleteMany();

        const user = await UserAngular.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
        });

        const tokenData = await createAccessToken(user);
        accessToken = tokenData.accessToken;
    });

    test("should logout successfully and blacklist token", async () => {
        const res = await request(app)
            .post("/api/cooking/authAngular/logout")
            .set(
                "Cookie",
                `${cookiesNames.cookingTogether}=${JSON.stringify(accessToken)}`
            )
            .send();

        expect(res.statusCode).toBe(204);

        const blacklisted = await InvalidToken.findOne({ token: accessToken });
        expect(blacklisted).not.toBeNull();

        const cookies = res.headers["set-cookie"];
        expect(
            cookies.some((c) =>
                c.startsWith(`${cookiesNames.cookingTogether}=`)
            )
        ).toBe(true);
        expect(
            cookies.find(
                (c) => c.includes("Max-Age=0") || c.includes("Expires=")
            )
        ).toBeDefined();
    });

    test("should fail if token is missing in cookie", async () => {
        const res = await request(app)
            .post("/api/cooking/authAngular/logout")
            .send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });
});

describe("GET /authAngular/profile", () => {
    beforeEach(async () => {
        await UserAngular.deleteMany();
    });

    test("should return profile of logged-in user", async () => {
        const user = await UserAngular.create({
            username: "exampleuser",
            email: "profile@example.com",
            password: "password",
        });
        global.userId = user._id.toString();

        const res = await request(app).get("/api/cooking/authAngular/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe("profile@example.com");
        expect(res.body.username).toBe("exampleuser");
    });

    test("should return 404 if user not exist", async () => {
        await UserAngular.create({
            username: "exampleuser",
            email: "profile@example.com",
            password: "password",
        });
        global.userId = validId;

        const res = await request(app).get("/api/cooking/authAngular/profile");

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no user with this id!");
    });
});
