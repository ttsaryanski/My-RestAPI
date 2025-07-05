import express from "express";
import request from "supertest";

import { classController } from "../../../../src/controllers/classBook/clssController.js";

import errorHandler from "../../../../src/middlewares/errorHandler.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

const mockClassService = {
    getAll: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    getByIdPopulate: jest.fn(),
    edit: jest.fn(),
    remove: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/clss", classController(mockClassService));
app.use(errorHandler);

describe("Class Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /clss - should return all classes", async () => {
        const mockData = [{ title: "Math 101" }];
        mockClassService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get("/clss");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockClassService.getAll).toHaveBeenCalledWith({});
    });

    test("POST /clss - should create a new class", async () => {
        const newClass = {
            title: "Science 101",
            teacher: validId,
            students: [],
        };
        const createdClass = { ...newClass, _createdBy: validId };
        mockClassService.create.mockResolvedValue(createdClass);

        const res = await request(app).post("/clss").send(newClass, validId);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdClass);
        expect(mockClassService.create).toHaveBeenCalledWith(newClass, validId);
    });

    test("POST /clss - should return 400 for invalid data", async () => {
        const invalidClass = {
            title: "Sc",
            teacher: "InvalidId",
            students: {},
        };

        const res = await request(app)
            .post("/clss")
            .send(invalidClass, validId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("GET /clss/:clssId - should return class by ID", async () => {
        const mockData = { _id: validId, title: "History 101" };
        mockClassService.getById.mockResolvedValue(mockData);

        const res = await request(app).get(`/clss/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockClassService.getById).toHaveBeenCalledWith(validId);
    });

    test("GET /clss/:clssId - should return 400 for invalid clssId format", async () => {
        const res = await request(app).get("/clss/invalId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("GET /clss/:clssId/populate - should return populated class by ID", async () => {
        const mockData = { _id: validId, title: "Geography 101", students: [] };
        mockClassService.getByIdPopulate.mockResolvedValue(mockData);

        const res = await request(app).get(`/clss/${validId}/populate`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockClassService.getByIdPopulate).toHaveBeenCalledWith(validId);
    });

    test("GET /clss/:clssId/populate - should return 400 for invalid clssId format", async () => {
        const res = await request(app).get("/clss/invalId/populate");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("PUT /clss/:clssId - should edit class", async () => {
        const updatedClass = {
            title: "Updated Class",
            teacher: validId,
            students: [validId],
        };
        mockClassService.edit.mockResolvedValue(updatedClass);

        const res = await request(app)
            .put(`/clss/${validId}`)
            .send(updatedClass);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(updatedClass);
        expect(mockClassService.edit).toHaveBeenCalledWith(
            validId,
            updatedClass
        );
    });

    test("PUT /clss/:clssId - should return 400 for invalid update data", async () => {
        const invalidUpdate = {
            title: "AB",
            teacher: "InvalidId",
            students: {},
        };

        const res = await request(app)
            .put(`/clss/${validId}`)
            .send(invalidUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("PUT /clss/:clssId - should return 400 for invalid clssId format", async () => {
        const validUpdate = {
            title: "Updated Class",
            teacher: validId,
            students: [validId],
        };

        const res = await request(app).put("/clss/noid").send(validUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("DELETE /clss/:clssId - should delete class", async () => {
        mockClassService.remove.mockResolvedValue();

        const res = await request(app).delete(`/clss/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockClassService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /clss/:clssId - should return 400 for invalid classId format", async () => {
        const res = await request(app).delete("/clss/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });
});
