import bcrypt from "bcrypt";
import jwt from "../../../../src/lib/jwt.js";

import { authService } from "../../../../src/services/gamesPlay/authService.js";
import UserGames from "../../../../src/models/gamesPlay/User.js";
import InvalidToken from "../../../../src/models/InvalidToken.js";

jest.mock("bcrypt");
jest.mock("../../../../src/lib/jwt.js");
jest.mock("../../../../src/models/gamesPlay/User.js");
jest.mock("../../../../src/models/InvalidToken.js");

process.env.JWT_SECRET = "test-secret";

describe("authService/register", () => {
    it("should throw if email already exists", async () => {
        UserGames.findOne.mockResolvedValue({ email: "test@mail.com" });

        await expect(
            authService.register("test@mail.com", "pass")
        ).rejects.toThrow("This email already registered!");
    });

    it("should create user and return access token", async () => {
        UserGames.findOne.mockResolvedValue(null);
        UserGames.create.mockResolvedValue({
            _id: "1",
            email: "a@b.bg",
            role: "user",
        });
        jwt.sign.mockResolvedValue("signedToken");

        const result = await authService.register("a@b.bg", "123456");
        expect(result).toEqual({ accessToken: "signedToken" });
    });
});

describe("authService/login", () => {
    it("should throw if user not found", async () => {
        UserGames.findOne.mockResolvedValue(null);

        await expect(authService.login("none@none.com", "123")).rejects.toThrow(
            "User does not exist!"
        );
    });

    it("should throw if password is invalid", async () => {
        UserGames.findOne.mockResolvedValue({
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
            role: "user",
            password: "hashed",
        };
        UserGames.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockResolvedValue("loginToken");

        const result = await authService.login("x@y.z", "123456");
        expect(result).toEqual({ accessToken: "loginToken" });
    });
});

describe("authService/getAllUsers", () => {
    it("should return paginated users sorted by role", async () => {
        UserGames.aggregate.mockResolvedValue([{ email: "a" }, { email: "b" }]);

        const result = await authService.getAllUsers({ page: 1 });

        expect(UserGames.aggregate).toHaveBeenCalled();
        expect(result).toEqual({ users: [{ email: "a" }, { email: "b" }] });
    });
});

describe("authService/logout", () => {
    it("should create invalid token record", async () => {
        InvalidToken.create.mockResolvedValue(true);

        await authService.logout("token123");

        expect(InvalidToken.create).toHaveBeenCalledWith({ token: "token123" });
    });
});

describe("authService/getUserById", () => {
    it("should return user if found", async () => {
        const user = { _id: "abc123", email: "user@example.com" };
        UserGames.findById = jest.fn().mockResolvedValue(user);

        const result = await authService.getUserById("abc123");

        expect(UserGames.findById).toHaveBeenCalledWith("abc123", {
            password: 0,
            __v: 0,
        });
        expect(result).toEqual(user);
    });

    it("should throw CustomError if user not found", async () => {
        UserGames.findById = jest.fn().mockResolvedValue(null);

        await expect(authService.getUserById("missing")).rejects.toMatchObject({
            name: "CustomError",
            message: "There is no user with this id!",
            statusCode: 404,
        });
    });
});

describe("authService/remove", () => {
    it("should delete user", async () => {
        UserGames.findByIdAndDelete.mockResolvedValue({ _id: "1" });

        await authService.remove("1");

        expect(UserGames.findByIdAndDelete).toHaveBeenCalledWith("1");
    });

    it("should throw CustomError if user not found", async () => {
        UserGames.findByIdAndDelete.mockResolvedValue(null);

        await expect(authService.remove("x")).rejects.toMatchObject({
            name: "CustomError",
            message: "User not found",
            statusCode: 404,
        });
    });
});

describe("authService/makeAdmin", () => {
    it("should update role to admin", async () => {
        const updated = { _id: "1", role: "admin" };
        UserGames.findByIdAndUpdate.mockResolvedValue(updated);

        const result = await authService.makeAdmin("1");

        expect(UserGames.findByIdAndUpdate).toHaveBeenCalledWith(
            "1",
            { role: "admin" },
            { new: true }
        );
        expect(result).toEqual(updated);
    });
});

describe("authService/updateRole", () => {
    it("should update all users without role", async () => {
        UserGames.updateMany.mockResolvedValue({ modifiedCount: 3 });

        const result = await authService.updateRole();

        expect(UserGames.updateMany).toHaveBeenCalledWith(
            { role: { $exists: false } },
            { $set: { role: "user" } }
        );
        expect(result).toEqual({ modifiedCount: 3 });
    });
});
