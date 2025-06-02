import express from "express";
import request from "supertest";

import { gameController } from "../../../src/controllers/gamesPlay/gameController.js";

import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
import { isOwner } from "../../../src/middlewares/ownerMiddleware.js";
import errorHandler from "../../../src/middlewares/errorHandler.js";

import { validId } from "../../../src/config/constans.js";

jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

jest.mock("../../../src/middlewares/ownerMiddleware.js", () => ({
    isOwner: () => (req, res, next) => next(),
}));

const mockGameService = {
    getAll: jest.fn(),
    getInfinity: jest.fn(),
    create: jest.fn(),
    lastThree: jest.fn(),
    getById: jest.fn(),
    edit: jest.fn(),
    remove: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/games", gameController(mockGameService));
app.use(errorHandler);

describe("Game Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /games - should return all games", async () => {
        const mockData = [{ title: "Game 1" }];
        mockGameService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get("/games");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockGameService.getAll).toHaveBeenCalledWith({});
    });

    test("GET /games/infinity - should return infinite games", async () => {
        const mockData = [{ title: "Game A" }];
        mockGameService.getInfinity.mockResolvedValue(mockData);

        const res = await request(app).get("/games/infinity");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
    });

    test("POST /games - should create a game", async () => {
        const newGame = {
            title: "New Game",
            category: "Action",
            maxLevel: 1,
            imageUrl: "https://valid-image.com",
            summary: "descdescdesc",
        };
        const createdGame = { ...newGame, _id: validId };
        mockGameService.create.mockResolvedValue(createdGame);

        const res = await request(app).post("/games").send(newGame);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdGame);
        expect(mockGameService.create).toHaveBeenCalledWith(newGame, validId);
    });

    test("POST /games - should return 400 for invalid data", async () => {
        const invalidGame = {
            title: "A",
            category: "",
            maxLevel: -1,
            imageUrl: "invalid-url",
            summary: "short",
        };

        const res = await request(app).post("/games").send(invalidGame);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("GET /games/last_three - should return last 3 games", async () => {
        const mockData = [{ title: "Game 1" }, { title: "Game 2" }];
        mockGameService.lastThree.mockResolvedValue(mockData);

        const res = await request(app).get("/games/last_three");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
    });

    test("GET /games/:gameId - should return game by id", async () => {
        const game = { _id: "id1", title: "Game" };
        mockGameService.getById.mockResolvedValue(game);

        const res = await request(app).get(`/games/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(game);
    });

    test("GET /games/:gameId - should return 400 for invalid gameId format", async () => {
        const res = await request(app).get("/games/invalid-id");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("PUT /games/:gameId - should edit game", async () => {
        const updatedGame = {
            title: "Updated Game",
            category: "Adventure",
            maxLevel: 1,
            imageUrl: "https://valid-image.com",
            summary: "descdescdesc",
        };
        mockGameService.edit.mockResolvedValue(updatedGame);

        const res = await request(app)
            .put(`/games/${validId}`)
            .send(updatedGame);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(updatedGame);
        expect(mockGameService.edit).toHaveBeenCalledWith(validId, updatedGame);
    });

    test("PUT /games/:gameId - should return 400 for invalid update data", async () => {
        const invalidUpdate = {
            title: "AB",
            category: "sh",
            maxLevel: 200,
            imageUrl: "ftp://wrong",
            summary: "",
        };

        const res = await request(app)
            .put("/games/some-id")
            .send(invalidUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("PUT /games/:gameId - should return 400 for invalid gameId format", async () => {
        const validUpdate = {
            title: "Valid Title",
            category: "Action",
            maxLevel: 10,
            imageUrl: "https://example.com/image.jpg",
            summary: "This is a valid summary.",
        };

        const res = await request(app)
            .put("/games/not-objectid")
            .send(validUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("DELETE /games/:gameId - should delete game", async () => {
        mockGameService.remove.mockResolvedValue();

        const res = await request(app).delete(`/games/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockGameService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /games/:gameId - should return 400 for invalid gameId format", async () => {
        const res = await request(app).delete("/games/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });
});
