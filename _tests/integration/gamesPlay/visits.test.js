import request from "supertest";

import app from "../../../src/app.js";
import Visit from "../../../src/models/gamesPlay/Visit.js";

describe("POST /visit", () => {
    beforeEach(async () => {
        await Visit.deleteMany();
    });

    it("should create new visit and return 201", async () => {
        const res = await request(app).post("/api/games_play/visit");

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("count");
    });
});
