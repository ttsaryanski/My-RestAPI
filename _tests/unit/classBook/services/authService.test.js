import bcrypt from "bcrypt";
import jwt from "../../../../src/lib/jwt.js";

import { authService } from "../../../../src/services/classBook/authService.js";
import { teacherService } from "../../../../src/services/classBook/teacherService.js";

import Setting from "../../../../src/models/classBook/Setting.js";
import User from "../../../../src/models/classBook/User.js";
import Student from "../../../../src/models/classBook/Student.js";
import InvalidToken from "../../../../src/models/InvalidToken.js";

import { CustomError } from "../../../../src/utils/errorUtils/customError.js";

jest.mock("bcrypt");
jest.mock("../../../../src/lib/jwt.js");
jest.mock("../../../../src/models/classBook/Setting.js");
jest.mock("../../../../src/models/classBook/User.js");
jest.mock("../../../../src/models/classBook/Student.js");
jest.mock("../../../../src/models/classBook/Teacher.js");
jest.mock("../../../../src/models/InvalidToken.js");
jest.mock("../../../../src/services/classBook/teacherService.js");

process.env.JWT_SECRET = "test-secret";

describe("authService/register", () => {
    it("should throw if email already exists", async () => {
        User.findOne.mockResolvedValue({ email: "test@mail.com" });

        await expect(
            authService.register("test@mail.com", "pass")
        ).rejects.toThrow("This email already registered!");
    });

    it("should create student user and new student record and return access token", async () => {
        User.findOne.mockResolvedValue(null);
        Setting.findOne.mockResolvedValue({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });
        const createdUser = {
            _id: "mockUserId",
            firstName: "user",
            lastName: "userov",
            email: "a@b.bg",
            role: "student",
        };
        User.create.mockResolvedValue(createdUser);
        Student.findOne.mockResolvedValue(null);
        Student.create.mockResolvedValue({});
        jwt.sign.mockResolvedValue("signedToken");

        const result = await authService.register(
            "user",
            "userov",
            "a@b.bg",
            "123",
            undefined,
            "password",
            null
        );
        expect(result).toEqual({ accessToken: "signedToken" });
        expect(Student.create).toHaveBeenCalledWith({
            firstName: "user",
            lastName: "userov",
            identifier: "123",
            email: "a@b.bg",
            _ownerId: "mockUserId",
            clss: [],
        });
    });

    it("should create student user and update existing student and return access token", async () => {
        User.findOne.mockResolvedValue(null);
        Setting.findOne.mockResolvedValue({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });
        const createdUser = {
            _id: "mockUserId",
            firstName: "user",
            lastName: "userov",
            email: "a@b.bg",
            role: "student",
        };
        User.create.mockResolvedValue(createdUser);
        const mockStudent = {
            _id: "studentId",
            _ownerId: null,
            email: null,
            save: jest.fn().mockResolvedValue(true),
        };
        Student.findOne.mockResolvedValue(mockStudent);

        jwt.sign.mockResolvedValue("mockToken");

        const result = await authService.register(
            "user",
            "userov",
            "a@b.bg",
            "123",
            undefined,
            "password",
            null
        );

        expect(result).toEqual({ accessToken: "mockToken" });
        expect(mockStudent._ownerId).toBe("mockUserId");
        expect(mockStudent.email).toBe("a@b.bg");
        expect(mockStudent.save).toHaveBeenCalled();
    });

    it("should create teacher user and return access token", async () => {
        User.findOne.mockResolvedValue(null);
        Setting.findOne.mockResolvedValue({
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        });
        const createdUser = {
            _id: "mockUserId",
            firstName: "user",
            lastName: "userov",
            email: "a@b.bg",
            role: "teacher",
        };
        User.create.mockResolvedValue(createdUser);
        jwt.sign.mockResolvedValue("signedToken");

        teacherService.create.mockResolvedValue(true);
        const result = await authService.register(
            "user",
            "userov",
            "a@b.bg",
            undefined,
            "teacher-secret",
            "password",
            null
        );
        expect(result).toEqual({ accessToken: "signedToken" });
        expect(teacherService.create).toHaveBeenCalledWith(
            {
                firstName: "user",
                lastName: "userov",
                email: "a@b.bg",
                clss: [],
            },
            "mockUserId"
        );
    });
});

describe("authService/login", () => {
    it("should throw if user not found", async () => {
        User.findOne.mockResolvedValue(null);

        await expect(authService.login("none@none.com", "123")).rejects.toThrow(
            "User does not exist!"
        );
    });

    it("should throw if password is invalid", async () => {
        User.findOne.mockResolvedValue({
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
        User.findOne.mockResolvedValue(user);
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

        expect(InvalidToken.create).toHaveBeenCalledWith({ token: "token123" });
    });
});

describe("authService/getUserById", () => {
    it("should return user if found", async () => {
        const user = { _id: "abc123", email: "user@example.com" };
        User.findById = jest.fn().mockResolvedValue(user);

        const result = await authService.getUserById("abc123");

        expect(User.findById).toHaveBeenCalledWith("abc123");
        expect(result).toEqual(user);
    });

    it("should throw CustomError if user not found", async () => {
        User.findById = jest.fn().mockResolvedValue(null);

        await expect(authService.getUserById("missing")).rejects.toMatchObject({
            name: "CustomError",
            message: "There is no user with this id!",
            statusCode: 404,
        });
    });
});

describe("authService/editUser", () => {
    it("should update and return the updated user", async () => {
        const userId = "some-user-id";
        const updateData = { firstName: "User" };
        const updatedUser = { _id: userId, ...updateData };

        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const result = await authService.editUser(userId, updateData);

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            updateData,
            {
                runValidators: true,
                new: true,
            }
        );
        expect(result).toEqual(updatedUser);
    });

    it("should throw CustomError if no user is found to update", async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await authService.editUser("nonexistent-id", { firstName: "User" });
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
        }
    });
});
