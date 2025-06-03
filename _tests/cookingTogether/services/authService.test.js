import bcrypt from "bcrypt";

import jwt from "../../../src/lib/jwt.js";

import { authService } from "../../../src/services/cookingTogether/authService.js";

import UserAngular from "../../../src/models/cookingTogether/User.js";
import InvalidToken from "../../../src/models/InvalidToken.js";

jest.mock("bcrypt");
jest.mock("../../../src/lib/jwt.js");
jest.mock("../../../src/models/cookingTogether/User.js");
jest.mock("../../../src/models/InvalidToken.js");

process.env.JWT_SECRET = "test-secret";

describe("authService/register", () => {
    it("should throw if username or email already exists", async () => {
        UserAngular.findOne.mockResolvedValue({
            username: "testuser",
            email: "test@mail.com",
        });

        await expect(
            authService.register("testuser", "test@mail.com", "pass")
        ).rejects.toThrow("This username or email already registered!");
    });

    it("should create user and return access token", async () => {
        UserAngular.findOne.mockResolvedValue(null);
        UserAngular.create.mockResolvedValue({
            _id: "1",
            username: "a",
            email: "a@b.bg",
        });
        jwt.sign.mockResolvedValue("signedToken");

        const result = await authService.register("a", "a@b.bg", "123456");
        expect(result).toEqual({ accessToken: "signedToken" });
    });

    describe("authService/login", () => {
        it("should throw if user not found", async () => {
            UserAngular.findOne.mockResolvedValue(null);

            await expect(
                authService.login("none@none.com", "123")
            ).rejects.toThrow("User does not exist!");
        });

        it("should throw if password is invalid", async () => {
            UserAngular.findOne.mockResolvedValue({
                email: "test",
                password: "hashed",
            });
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.login("test", "wrong")).rejects.toThrow(
                "Password does not match!"
            );
        });

        it("should return access token on valid login", async () => {
            const user = {
                _id: "1",
                email: "x@y.z",
                password: "hashed",
            };
            UserAngular.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockResolvedValue("loginToken");

            const result = await authService.login("x@y.z", "123456");
            expect(result).toEqual({ accessToken: "loginToken" });
        });
    });

    describe("authService/logout", () => {
        it("should create invalid token record", async () => {
            InvalidToken.create.mockResolvedValue(true);

            await authService.logout("token123");

            expect(InvalidToken.create).toHaveBeenCalledWith({
                token: "token123",
            });
        });
    });

    describe("authService/getUserById", () => {
        it("should return user if found", async () => {
            const user = { _id: "abc123", email: "user@example.com" };
            UserAngular.findById = jest.fn().mockResolvedValue(user);

            const result = await authService.getUserById("abc123");

            expect(UserAngular.findById).toHaveBeenCalledWith("abc123");
            expect(result).toEqual(user);
        });

        it("should throw CustomError if user not found", async () => {
            UserAngular.findById = jest.fn().mockResolvedValue(null);

            await expect(
                authService.getUserById("missing")
            ).rejects.toMatchObject({
                name: "CustomError",
                message: "There is no user with this id!",
                statusCode: 404,
            });
        });
    });
});
