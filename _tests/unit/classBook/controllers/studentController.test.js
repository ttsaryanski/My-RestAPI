import express from "express";
import request from "supertest";

import { studentController } from "../../../../src/controllers/classBook/studentController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

const mockStudentService = {
    getAll: jest.fn(),
    create: jest.fn(),
    getAllPaginated: jest.fn(),
    getById: jest.fn(),
    getByIdPopulate: jest.fn(),
    edit: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/student", studentController(mockStudentService));
app.use(errorHandler);

describe("Student Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /student - should return all students", async () => {
        const mockData = [{ firstName: "Student 1" }];
        mockStudentService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get("/student");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockStudentService.getAll).toHaveBeenCalledWith({});
    });

    test("POST /student - should create a student", async () => {
        const newStudent = {
            firstName: "FirstName",
            lastName: "LastName",
            identifier: "1234567890",
        };
        const createdStudent = { ...newStudent, _ownerId: validId };
        mockStudentService.create.mockResolvedValue(createdStudent);

        const res = await request(app).post("/student").send(newStudent);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdStudent);
        expect(mockStudentService.create).toHaveBeenCalledWith(
            newStudent,
            validId
        );
    });

    test("POST /student - should return 400 for invalid data", async () => {
        const invalidStudent = {
            firstName: "Fi",
            lastName: "La",
            identifier: "test",
        };

        const res = await request(app).post("/student").send(invalidStudent);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("POST /student/paginated - should return paginated students", async () => {
        const mockData = {
            students: { firstName: "Student 1" },
            totalCount: 2,
            totalPages: 1,
            currentPage: 1,
        };
        mockStudentService.getAllPaginated.mockResolvedValue(mockData);

        const res = await request(app).post("/student/paginated");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
    });

    test("GET /student/:studentId - should return student by id", async () => {
        const student = { _id: "id1", firstName: "Student 1" };
        mockStudentService.getById.mockResolvedValue(student);

        const res = await request(app).get(`/student/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(student);
    });

    test("GET /student/:studentId - should return 400 for invalid studentId format", async () => {
        const res = await request(app).get("/student/invalid");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("GET /student/:studentId/populate - should return populated student by ID", async () => {
        const mockData = { _id: validId, firstName: "Student 1", classes: [] };
        mockStudentService.getByIdPopulate.mockResolvedValue(mockData);

        const res = await request(app).get(`/student/${validId}/populate`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockStudentService.getByIdPopulate).toHaveBeenCalledWith(
            validId
        );
    });

    test("GET /student/:studentId/populate - should return 400 for invalid studentId format", async () => {
        const res = await request(app).get("/student/invalId/populate");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("PUT /student/:studentId - should edit student", async () => {
        const validUpdate = {
            grades: [
                {
                    teacher: validId,
                    class: validId,
                    value: 6,
                    comment: "Excellent work!",
                },
            ],
        };
        mockStudentService.edit.mockResolvedValue(validUpdate);

        const res = await request(app)
            .put(`/student/${validId}`)
            .send(validUpdate);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(validUpdate);
        expect(mockStudentService.edit).toHaveBeenCalledWith(
            validId,
            validUpdate
        );
    });

    test("PUT /student/:studentId - should return 400 for invalid update data", async () => {
        const invalidUpdate = {
            grades: [
                {
                    teacher: "invalid",
                    class: "invalid",
                    value: "6",
                    comment: 5,
                },
            ],
        };

        const res = await request(app)
            .put(`/student/${validId}`)
            .send(invalidUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("PUT /student/:studentId - should return 400 for invalid studentId format", async () => {
        const validUpdate = {
            grades: [
                {
                    teacher: validId,
                    class: validId,
                    value: 6,
                    comment: "Excellent work!",
                },
            ],
        };

        const res = await request(app)
            .put("/student/objectid")
            .send(validUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });
});
