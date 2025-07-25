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
import Student from "../../../src/models/classBook/Student.js";

describe("GET /student", () => {
    it("should return empty array", async () => {
        const res = await request(app).get("/api/class/student");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return all existing students", async () => {
        await Student.create([
            {
                firstName: "firstname1",
                lastName: "lastname1",
                identifier: "0000000001",
            },
            {
                firstName: "firstname2",
                lastName: "lastname2",
                identifier: "0000000002",
            },
        ]);

        const res = await request(app).get("/api/class/student");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("firstName");
        expect(res.body[0]).toHaveProperty("identifier");
    });
});

describe("POST /student", () => {
    beforeEach(async () => {
        await Student.deleteMany();
    });

    it("should create new student and return 201", async () => {
        const newStudent = {
            firstName: "firstname1",
            lastName: "lastname1",
            identifier: "0000000001",
        };

        const res = await request(app)
            .post("/api/class/student")
            .send(newStudent);

        expect(res.statusCode).toBe(201);
        expect(res.body.firstName).toBe("firstname1");
        expect(res.body._ownerId).toBe(validId);

        const dbEntry = await Student.findOne({ firstName: "firstname1" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectData = {
            firstName: "Fi",
            lastName: "La",
            identifier: "abc",
        };

        const res = await request(app)
            .post("/api/class/student")
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Student.findOne({ irstName: "Fi" });
        expect(dbEntry).toBeNull();
    });
});

describe("POST /student/paginated", () => {
    beforeEach(async () => {
        const students = [];

        for (let i = 1; i <= 9; i++) {
            students.push({
                firstName: `firstname${i}`,
                lastName: `lastname${i}`,
                identifier: `000000000${i}`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        for (let j = 10; j <= 11; j++) {
            students.push({
                firstName: `firstname${j}`,
                lastName: `lastname${j}`,
                identifier: `00000000${j}`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - j * 1000),
            });
        }

        await Student.insertMany(students);
    });

    it("should return to 9 students for page 1", async () => {
        const res = await request(app).post("/api/class/student/paginated");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.students)).toBe(true);
        expect(res.body.students.length).toBe(9);
        expect(res.body.students[0].firstName).toBe("firstname1");
    });

    it("should return remaining students for page 2", async () => {
        const res = await request(app)
            .post("/api/class/student/paginated")
            .send({ page: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body.students.length).toBe(2);
        expect(res.body.students[0].firstName).toBe("firstname10");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app)
            .post("/api/class/student/paginated")
            .send({ page: 3 });

        expect(res.statusCode).toBe(200);
        expect(res.body.students.length).toBe(0);
        expect(res.body).toStrictEqual({
            currentPage: 3,
            students: [],
            totalCount: 11,
            totalPages: 2,
        });
    });
});

describe("GET /student/:studentId", () => {
    let student;
    beforeEach(async () => {
        await Student.deleteMany();

        student = await Student.create({
            firstName: "firstname1",
            lastName: "lastname1",
            identifier: "0000000001",
            _ownerId: validId,
        });
    });

    it("should return one student by id", async () => {
        const res = await request(app).get(`/api/class/student/${student._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).toBe("firstname1");
        expect(res.body).toHaveProperty("_id", student._id.toString());
    });

    it("should return 400 if studentId is invalid", async () => {
        const res = await request(app).get("/api/class/student/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 404 if student not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/class/student/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no student with this id!");
    });
});

describe("GET /student/:studentId/populate", () => {
    let student;
    beforeEach(async () => {
        await Student.deleteMany();

        student = await Student.create({
            firstName: "firstname1",
            lastName: "lastname1",
            identifier: "0000000001",
            _ownerId: validId,
        });
    });

    it("should return one student by id", async () => {
        const res = await request(app).get(
            `/api/class/student/${student._id}/populate`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).toBe("firstname1");
        expect(res.body).toHaveProperty("_id", student._id.toString());
    });

    it("should return 400 if studentId is invalid", async () => {
        const res = await request(app).get(
            "/api/class/student/invalidId/populate"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 404 if student not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/class/student/${nonExistingId}/populate`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no student with this id!");
    });
});

describe("PUT /student/:studentId", () => {
    let student;
    beforeEach(async () => {
        await Student.deleteMany();

        student = await Student.create({
            firstName: "firstname1",
            lastName: "lastname1",
            identifier: "0000000001",
            _ownerId: validId,
        });
    });

    const editedData = {
        clssToAdd: new mongoose.Types.ObjectId(),
        grades: [
            {
                teacher: new mongoose.Types.ObjectId(),
                class: new mongoose.Types.ObjectId(),
                value: 5,
                comment: "Exellent",
            },
        ],
    };

    const incorectData = {
        clssToAdd: "invalidId",
        grades: [
            {
                teacher: "invalidId",
                class: "invalidId",
                value: 10,
                comment: 6,
            },
        ],
    };

    it("should edit student by id", async () => {
        const res = await request(app)
            .put(`/api/class/student/${student._id}`)
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body._id).toBe(student._id.toString());
        expect(res.body.clss[0]).toBe(editedData.clssToAdd.toString());
        expect(res.body.grades.length).not.toBe(0);
    });

    it("should return 400 if studentId is invalid", async () => {
        const res = await request(app)
            .put("/api/class/student/invalidId")
            .send(editedData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put(`/api/class/student/${student._id}`)
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if student not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/class/student/${nonExistingId}`)
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Student not found!");
    });
});
