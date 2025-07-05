import { validId } from "../../../src/config/constans.js";
import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
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
import Clss from "../../../src/models/classBook/Clss.js";

describe("GET /clss", () => {
    it("should return empty array", async () => {
        const res = await request(app).get("/api/class/clss");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return all existing classes", async () => {
        await Clss.create([
            {
                title: "Class One",
                teacher: new mongoose.Types.ObjectId(),
            },
            {
                title: "Class Thu",
                teacher: new mongoose.Types.ObjectId(),
            },
        ]);

        const res = await request(app).get("/api/class/clss");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("teacher");
    });
});

describe("POST /clss", () => {
    beforeEach(async () => {
        await Clss.deleteMany();
    });

    it("should create new class and return 201", async () => {
        const newClass = {
            title: "Class One",
            teacher: new mongoose.Types.ObjectId(),
            students: Array.from(
                { length: Math.floor(Math.random() * 10) },
                () => new mongoose.Types.ObjectId()
            ),
        };

        const res = await request(app).post("/api/class/clss").send(newClass);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Class One");
        expect(res.body._createdBy).toBe(validId);

        const dbEntry = await Clss.findOne({ title: "Class One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectData = {
            title: "Cl",
            teacher: "teacherId",
            students: ["id1", "id2", "id3"],
        };

        const res = await request(app)
            .post("/api/class/clss")
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Clss.findOne({ title: "Cl" });
        expect(dbEntry).toBeNull();
    });
});

describe("GET /clss/:clssId", () => {
    let clss;
    beforeEach(async () => {
        await Clss.deleteMany();

        clss = await Clss.create({
            title: "Class One",
            teacher: new mongoose.Types.ObjectId(),
            students: Array.from(
                { length: Math.floor(Math.random() * 10) },
                () => new mongoose.Types.ObjectId()
            ),
            _createdBy: validId,
        });
    });

    it("should return one class by id", async () => {
        const res = await request(app).get(`/api/class/clss/${clss._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Class One");
        expect(res.body).toHaveProperty("_id", clss._id.toString());
    });

    it("should return 400 if classId is invalid", async () => {
        const res = await request(app).get("/api/class/clss/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 404 if class not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(`/api/class/clss/${nonExistingId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no class with this id!");
    });
});

describe("GET /clss/:clssId/populate", () => {
    let clss;
    beforeEach(async () => {
        await Clss.deleteMany();

        clss = await Clss.create({
            title: "Class One",
            teacher: new mongoose.Types.ObjectId(),
            students: Array.from(
                { length: Math.floor(Math.random() * 10) },
                () => new mongoose.Types.ObjectId()
            ),
            _createdBy: validId,
        });
    });

    it("should return one class by id", async () => {
        const res = await request(app).get(
            `/api/class/clss/${clss._id}/populate`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Class One");
        expect(res.body).toHaveProperty("_id", clss._id.toString());
    });

    it("should return 400 if classId is invalid", async () => {
        const res = await request(app).get(
            "/api/class/clss/invalidId/populate"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 404 if class not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/class/clss/${nonExistingId}/populate`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no class with this id!");
    });
});

describe("PUT /clss/:clssId", () => {
    let clss;
    beforeEach(async () => {
        await Clss.deleteMany();

        clss = await Clss.create({
            title: "Class One",
            teacher: validId,
            students: [],
            _createdBy: new mongoose.Types.ObjectId(),
        });
    });

    const editedData = {
        title: "Edited Class",
        teacher: validId,
        students: Array.from(
            { length: Math.floor(Math.random() * 10) },
            () => new mongoose.Types.ObjectId()
        ),
    };

    const incorectData = {
        title: "Cl",
        teacher: "teacherId",
        students: ["id1", "id2", "id3"],
    };

    it("should edit class by id", async () => {
        const res = await request(app)
            .put(`/api/class/clss/${clss._id}`)
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Edited Class");
    });

    it("should return 400 if classId is invalid", async () => {
        const res = await request(app)
            .put("/api/class/clss/invalidId")
            .send(editedData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put(`/api/class/clss/${clss._id}`)
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if class not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/class/clss/${nonExistingId}`)
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Class not found");
    });
});

describe("DELETE /clss/:clssId", () => {
    let clss;
    beforeEach(async () => {
        await Clss.deleteMany();

        clss = await Clss.create({
            title: "Class One",
            teacher: validId,
            students: [],
            _createdBy: new mongoose.Types.ObjectId(),
        });
    });

    it("should remove class by id", async () => {
        const res = await request(app).delete(`/api/class/clss/${clss._id}`);

        expect(res.statusCode).toBe(204);

        const dbEntry = await Clss.findOne({ title: "Class One" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if classId is invalid", async () => {
        const res = await request(app).delete("/api/class/clss/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");

        const dbEntry = await Clss.findOne({ title: "Class One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if class not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/class/clss/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Class not found");

        const dbEntry = await Clss.findOne({ title: "Class One" });
        expect(dbEntry).not.toBeNull();
    });
});
