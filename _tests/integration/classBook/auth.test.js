import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: global.userId };
        req.isAuthenticated = true;
        next();
    },
}));

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

import app from "../../../src/app.js";
import User from "../../../src/models/classBook/User.js";
import InvalidToken from "../../../src/models/InvalidToken.js";
import Setting from "../../../src/models/classBook/Setting.js";

import s3 from "../../../src/utils/awsUtils/AWS S3 client.js";

import { validId } from "../../../src/config/constans.js";
import { cookiesNames } from "../../../src/config/constans.js";

import { createAccessToken } from "../../../src/services/classBook/authService.js";

jest.mock("@aws-sdk/client-s3", () => {
    const sendMock = jest.fn().mockResolvedValue({ ETag: '"mocked-etag"' });
    return {
        S3Client: jest.fn(() => ({
            send: sendMock,
        })),
        PutObjectCommand: jest.fn(),
    };
});

describe("POST /auth/register", () => {
    beforeEach(async () => {
        await User.deleteMany();
        await Setting.deleteMany();

        await Setting.create({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });

        await User.create({
            firstName: "existuserfirstName",
            lastName: "existuserlastName",
            identifier: "0123456789",
            secretKey: undefined,
            email: "existuser@email.com",
            password: "password",
        });
    });

    it("should create new user and return 204", async () => {
        const newUser = {
            firstName: "user",
            lastName: "userov",
            identifier: "9876543210",
            secretKey: undefined,
            email: "user@email.com",
            password: "password",
        };

        const res = await request(app)
            .post("/api/class/auth/register")
            .send(newUser);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.classBook + "=")
        );
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/Secure/);

        const dbEntry = await User.findOne({ email: newUser.email });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 409 if user exist", async () => {
        const newUser = {
            firstName: "firstName",
            lastName: "lastName",
            identifier: "0123456798",
            secretKey: undefined,
            email: "existuser@email.com",
            password: "password",
        };

        const res = await request(app)
            .post("/api/class/auth/register")
            .send(newUser);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("This email already registered!");
    });

    it("should return 400 if data is incorect", async () => {
        const incorectUser = {
            firstName: "us",
            lastName: "ov",
            identifier: "9876543",
            secretKey: undefined,
            email: "notvalidemail.com",
            password: "pa",
        };

        const res = await request(app)
            .post("/api/class/auth/register")
            .send(incorectUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await User.findOne({
            email: incorectUser.email,
        });
        expect(dbEntry).toBeNull();
    });

    it("should upload profile picture and create user", async () => {
        const testImagePath = path.join(__dirname, "..", "test-image.jpg");

        expect(fs.existsSync(testImagePath)).toBe(true);

        const res = await request(app)
            .post("/api/class/auth/register")
            .field("firstName", "fileuserfirstname")
            .field("lastName", "fileuserlastname")
            .field("email", "fileuser@email.com")
            .field("identifier", "9876543210")
            .field("password", "password")
            .attach("profilePicture", testImagePath);

        expect(res.statusCode).toBe(204);

        const user = await User.findOne({ email: "fileuser@email.com" });
        expect(user).not.toBeNull();

        expect(user.profilePicture).toBeDefined();
        expect(user.profilePicture.fileName).toBe("test-image.jpg");
        expect(user.profilePicture.fileUrl).toMatch(
            /^https:\/\/.*\.s3\.amazonaws\.com\/.*/
        );
    });
});

describe("POST /auth/register - file upload with AWS mock", () => {
    const testImagePath = path.join(__dirname, "..", "test-image.jpg");

    beforeEach(async () => {
        await User.deleteMany();
        await Setting.deleteMany();

        await Setting.create({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });

        jest.spyOn(s3, "send").mockResolvedValue({
            ETag: '"mocked-etag"',
        });

        jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should upload profile picture and create user", async () => {
        expect(fs.existsSync(testImagePath)).toBe(true);

        const res = await request(app)
            .post("/api/class/auth/register")
            .field("firstName", "fileuserfirstname")
            .field("lastName", "fileuserlastname")
            .field("identifier", "9876543210")
            .field("email", "fileuser@email.com")
            .field("password", "password")
            .attach("profilePicture", testImagePath);

        expect(res.statusCode).toBe(204);

        const user = await User.findOne({ email: "fileuser@email.com" });
        expect(user).not.toBeNull();

        expect(user.profilePicture).toBeDefined();
        expect(user.profilePicture.fileName).toBe("test-image.jpg");
        expect(user.profilePicture.fileUrl).toMatch(
            /^https:\/\/.*\.s3\.amazonaws\.com\/.*/
        );
    });
});

describe("POST /auth/login", () => {
    const userData = {
        firstName: "testuser",
        lastName: "testuserov",
        email: "testuser@example.com",
        password: "securePass123",
        identifier: "0123456789",
    };

    beforeEach(async () => {
        await User.deleteMany();

        await User.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
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
            .post("/api/class/auth/login")
            .send(loginData);

        expect(res.statusCode).toBe(204);
        const setCookieHeader = res.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();
        const cookie = setCookieHeader.find((c) =>
            c.startsWith(cookiesNames.classBook + "=")
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
            .post("/api/class/auth/login")
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
            .post("/api/class/auth/login")
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
            .post("/api/class/auth/login")
            .send(loginData);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Password does not match!");
    });
});

describe("POST /auth/logout", () => {
    const userData = {
        firstName: "testuser",
        lastName: "testuserov",
        email: "testuser@example.com",
        password: "securePass123",
        identifier: "0123456789",
    };

    let accessToken;
    beforeEach(async () => {
        await User.deleteMany();
        await InvalidToken.deleteMany();

        const user = await User.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
        });

        const tokenData = await createAccessToken(user);
        accessToken = tokenData.accessToken;
    });

    test("should logout successfully and blacklist token", async () => {
        const res = await request(app)
            .post("/api/class/auth/logout")
            .set(
                "Cookie",
                `${cookiesNames.classBook}=${JSON.stringify(accessToken)}`
            )
            .send();

        expect(res.statusCode).toBe(204);

        const blacklisted = await InvalidToken.findOne({ token: accessToken });
        expect(blacklisted).not.toBeNull();

        const cookies = res.headers["set-cookie"];
        expect(
            cookies.some((c) => c.startsWith(`${cookiesNames.classBook}=`))
        ).toBe(true);
        expect(
            cookies.find(
                (c) => c.includes("Max-Age=0") || c.includes("Expires=")
            )
        ).toBeDefined();
    });

    test("should fail if token is missing in cookie", async () => {
        const res = await request(app).post("/api/class/auth/logout").send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Missing token in cookies!");
    });
});

describe("GET /auth/profile", () => {
    beforeEach(async () => {
        await User.deleteMany();
    });

    test("should return profile of logged-in user", async () => {
        const user = await User.create({
            firstName: "testuser",
            lastName: "testuserov",
            email: "testuser@example.com",
            password: "securePass123",
            identifier: "0123456789",
        });
        global.userId = user._id.toString();

        const res = await request(app).get("/api/class/auth/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe("testuser@example.com");
        expect(res.body.firstName).toBe("testuser");
    });

    test("should return 404 if user not exist", async () => {
        await User.create({
            firstName: "testuser",
            lastName: "testuserov",
            email: "testuser@example.com",
            password: "securePass123",
            identifier: "0123456789",
        });
        global.userId = validId;

        const res = await request(app).get("/api/class/auth/profile");

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no user with this id!");
    });
});

describe("PUT /auth/profile without file upload", () => {
    beforeEach(async () => {
        await User.deleteMany();
        await Setting.deleteMany();

        await Setting.create({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });
    });

    const editedData = {
        firstName: "edited firstname",
        lastName: "edited lastname",
    };

    const fakeData = {
        firstName: "fi",
        lastName: "la",
    };

    it("should edit user data", async () => {
        const user = await User.create({
            firstName: "testuser",
            lastName: "testuserov",
            email: "testuser@example.com",
            password: "securePass123",
            identifier: undefined,
            secretKey: "teacher-secret",
        });
        global.userId = user._id.toString();

        const res = await request(app)
            .put("/api/class/auth/profile")
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body.firstName).toBe("edited firstname");
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put("/api/class/auth/profile")
            .send(fakeData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if user not found", async () => {
        await User.create({
            firstName: "testuser",
            lastName: "testuserov",
            email: "testuser@example.com",
            password: "securePass123",
            identifier: undefined,
            secretKey: "teacher-secret",
        });
        global.userId = validId;

        const res = await request(app)
            .put("/api/class/auth/profile")
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });
});

describe("PUT /auth/profile - edit user data with file upload with AWS mock", () => {
    const testImagePath = path.join(__dirname, "..", "test-image.jpg");

    beforeEach(async () => {
        await User.deleteMany();
        await Setting.deleteMany();

        await Setting.create({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });

        jest.spyOn(s3, "send").mockResolvedValue({
            ETag: '"mocked-etag"',
        });

        jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should upload profile picture and update user", async () => {
        expect(fs.existsSync(testImagePath)).toBe(true);
        const user = await User.create({
            firstName: "testuser",
            lastName: "testuserov",
            email: "testuser@example.com",
            password: "securePass123",
            identifier: undefined,
            secretKey: "teacher-secret",
        });
        global.userId = user._id.toString();

        const res = await request(app)
            .put("/api/class/auth/profile")
            .field("firstName", "editedfileuserfirstname")
            .field("lastName", "editedfileuserlastname")
            .attach("profilePicture", testImagePath);

        expect(res.statusCode).toBe(201);

        const updatedUser = await User.findOne({
            firstName: "editedfileuserfirstname",
        });
        expect(updatedUser).not.toBeNull();

        expect(updatedUser.profilePicture).toBeDefined();
        expect(updatedUser.profilePicture.fileName).toBe("test-image.jpg");
        expect(updatedUser.profilePicture.fileUrl).toMatch(
            /^https:\/\/.*\.s3\.amazonaws\.com\/.*/
        );
    });
});
