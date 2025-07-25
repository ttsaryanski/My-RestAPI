import { validId } from "../../../src/config/constans.js";
const mockUserId = validId;
jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: mockUserId };
        req.isAuthenticated = true;
        next();
    },
}));

import request from "supertest";
import mongoose from "mongoose";

import app from "../../../src/app.js";
import Teacher from "../../../src/models/classBook/Teacher.js";

describe("GET /teacher", () => {
    it("should return empty array", async () => {
        const res = await request(app).get("/api/class/teacher");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return all existing teachers", async () => {
        await Teacher.create([
            {
                firstName: "firstname1",
                lastName: "lastname1",
                email: "teacher1@example.com",
                speciality: "math",
            },
            {
                firstName: "firstname2",
                lastName: "lastname2",
                email: "teacher2@example.com",
                speciality: "history",
            },
        ]);

        const res = await request(app).get("/api/class/teacher");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("firstName");
        expect(res.body[0]).toHaveProperty("speciality");
    });
});

describe("GET /teacher/:teachertId", () => {
    let teacher;
    beforeEach(async () => {
        await Teacher.deleteMany();

        teacher = await Teacher.create({
            firstName: "firstname1",
            lastName: "lastname1",
            speciality: "math",
            _ownerId: validId,
        });
    });

    it("should return one teacher by id", async () => {
        const res = await request(app).get(`/api/class/teacher/${teacher._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).toBe("firstname1");
        expect(res.body).toHaveProperty("speciality", teacher.speciality);
        expect(res.body).toHaveProperty("_id", teacher._id.toString());
    });

    it("should return 400 if teacherId is invalid", async () => {
        const res = await request(app).get("/api/class/teacher/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 404 if teacher not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/class/teacher/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no teacher with this id!");
    });
});

describe("PUT /teacher/:teacherId", () => {
    let teacher;
    beforeEach(async () => {
        await Teacher.deleteMany();

        teacher = await Teacher.create({
            firstName: "firstname1",
            lastName: "lastname1",
            speciality: "math",
            _ownerId: validId,
        });
    });

    const editedData = {
        firstName: "Edited firstname1",
        lastName: "Edited lastname1",
        speciality: "Edited math",
        clssToAdd: new mongoose.Types.ObjectId(),
    };

    const incorectData = {
        firstName: "fi",
        lastName: "la",
        speciality: "ma",
        clssToAdd: "invalidId",
    };

    it("should edit teacher by id", async () => {
        const res = await request(app)
            .put(`/api/class/teacher/${teacher._id}`)
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body._id).toBe(teacher._id.toString());
        expect(res.body.clss[0]).toBe(editedData.clssToAdd.toString());
        expect(res.body.speciality).toBe("Edited math");
    });

    it("should return 400 if teacherId is invalid", async () => {
        const res = await request(app)
            .put("/api/class/teacher/invalidId")
            .send(editedData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put(`/api/class/teacher/${teacher._id}`)
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if teacher not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/class/teacher/${nonExistingId}`)
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Teacher not found!");
    });
});
