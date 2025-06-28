import express from "express";
import request from "supertest";

import { teacherController } from "../../../../src/controllers/classBook/teacherController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

const mockTeacherService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    edit: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/teacher", teacherController(mockTeacherService));
app.use(errorHandler);

describe("Teacher Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /teacher - should return all teachers", async () => {
        const mockData = [{ firstName: "Teacher 1" }];
        mockTeacherService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get("/teacher");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockTeacherService.getAll).toHaveBeenCalledWith({});
    });

    test("GET /teacher/:teacherId - should return teacher by ID", async () => {
        const mockData = { _id: "id1", firstName: "Teacher 1" };
        mockTeacherService.getById.mockResolvedValue(mockData);

        const res = await request(app).get(`/teacher/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockTeacherService.getById).toHaveBeenCalledWith(validId);
    });

    test("GET /teacher/:teacherId - should return 400 for invalid ID", async () => {
        const res = await request(app).get("/teacher/invalid");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("PUT /teacher/teacherId - should edit teacher", async () => {
        const updatedTeacher = {
            firstName: "Firstname",
            lastName: "Lastname",
            speciality: "Mathematics",
            clssToAdd: validId,
            clssToRemove: validId,
        };
        mockTeacherService.edit.mockResolvedValue(updatedTeacher);

        const res = await request(app)
            .put(`/teacher/${validId}`)
            .send(updatedTeacher);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(updatedTeacher);
        expect(mockTeacherService.edit).toHaveBeenCalledWith(
            validId,
            updatedTeacher
        );
    });

    test("PUT /teacher/:teacherId - should return 400 for invalid update data", async () => {
        const invalidUpdate = {
            firstName: "Fi",
            lastName: "La",
            speciality: "Ma",
            clssToAdd: "invalid",
            clssToRemove: "invalid",
        };

        const res = await request(app)
            .put("/teacher/some-id")
            .send(invalidUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("PUT /teacher/:teacherId - should return 400 for invalid teacherId format", async () => {
        const validUpdate = {
            firstName: "Firstname",
            lastName: "Lastname",
            speciality: "Mathematics",
            clssToAdd: validId,
            clssToRemove: validId,
        };

        const res = await request(app)
            .put("/teacher/objectid")
            .send(validUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });
});
