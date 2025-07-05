import request from "supertest";
import mongoose from "mongoose";

import app from "../../../src/app.js";
import Setting from "../../../src/models/classBook/Setting.js";

describe("POST /director", () => {
    beforeEach(async () => {
        await Setting.deleteMany();
    });

    it("should create new secret keys and return 201", async () => {
        const newSeting = {
            teacherKey: "teacher-secret",
            directorKey: "director-secret",
        };

        const res = await request(app)
            .post("/api/class/director")
            .send(newSeting);

        expect(res.statusCode).toBe(201);

        const dbEntry = await Setting.findOne({
            teacherKey: newSeting.teacherKey,
        });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectData = {
            teacherKey: "teacher",
            directorKey: "director",
        };

        const res = await request(app)
            .post("/api/class/director")
            .send(incorectData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Setting.findOne({
            teacherKey: incorectData.teacherKey,
        });
        expect(dbEntry).toBeNull();
    });
});
