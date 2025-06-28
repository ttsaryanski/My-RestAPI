import express from "express";
import request from "supertest";

import { visitController } from "../../../../src/controllers/gamesPlay/visitController.js";

import errorHandler from "../../../../src/middlewares/errorHandler.js";
import { realIp } from "../../../../src/middlewares/realIp.js";

const mockVisitService = {
    create: jest.fn(),
};

const app = express();
app.use(realIp);
app.use(express.json());
app.use("/visit", visitController(mockVisitService));
app.use(errorHandler);

describe("VisitController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /visits - should create a visit", async () => {
        mockVisitService.create.mockResolvedValue(7);

        const res = await request(app)
            .post("/visit")
            .send({ page: "home" })
            .set("X-Forwarded-For", "1.2.3.4");

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ count: 7 });
        expect(mockVisitService.create).toHaveBeenCalledWith(
            "home",
            expect.any(String)
        );
    });

    test("POST /visits - should default to 'home' page if none provided", async () => {
        mockVisitService.create.mockResolvedValue(3);

        const res = await request(app)
            .post("/visit")
            .send({})
            .set("X-Forwarded-For", "127.0.0.1");

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ count: 3 });
        expect(mockVisitService.create).toHaveBeenCalledWith(
            "home",
            expect.any(String)
        );
    });
});
