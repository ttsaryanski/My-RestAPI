import express from "express";
import request from "supertest";

import { directorController } from "../../../src/controllers/classBook/directorController.js";

import errorHandler from "../../../src/middlewares/errorHandler.js";

const mockDirectorService = {
    create: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/director", directorController(mockDirectorService));
app.use(errorHandler);

describe("Director Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /director - should create keys", async () => {
        const mockKeys = {
            teacherKey: "teacher123",
            directorKey: "director123",
        };
        mockDirectorService.create.mockResolvedValue(mockKeys);

        const res = await request(app).post("/director").send(mockKeys);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockKeys);
        expect(mockDirectorService.create).toHaveBeenCalledWith(mockKeys);
    });

    test("POST /director - should return 400 for invalid data", async () => {
        const res = await request(app).post("/director").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Teacher key is required");
    });
});
