import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
import { isOwner } from "../../../src/middlewares/ownerMiddleware.js";
jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        req.isAuthenticated = true;
        next();
    },
}));
jest.mock("../../../src/middlewares/ownerMiddleware.js", () => ({
    isOwner: () => (_req, _res, next) => next(),
}));

import request from "supertest";
import mongoose from "mongoose";

import app from "../../../src/app.js";
import Game from "../../../src/models/gamesPlay/Game.js";

import { validId } from "../../../src/config/constans.js";

describe("GET /games", () => {
    it("should return empty array", async () => {
        const res = await request(app).get("/api/games_play/games");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return all existing games", async () => {
        await Game.create([
            {
                title: "Game One",
                category: "RPG",
                maxLevel: 42,
                imageUrl: "http://example.com/img1.jpg",
                summary: "First test game summary",
                _ownerId: new mongoose.Types.ObjectId(),
            },
            {
                title: "Game Two",
                category: "Action",
                maxLevel: 33,
                imageUrl: "http://example.com/img2.jpg",
                summary: "Second test game summary",
                _ownerId: new mongoose.Types.ObjectId(),
            },
        ]);

        const res = await request(app).get("/api/games_play/games");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("category");
    });
});

describe("GET /games/infinity", () => {
    beforeEach(async () => {
        const games = [];

        for (let i = 1; i <= 7; i++) {
            games.push({
                title: `Game ${i}`,
                category: "Test",
                maxLevel: 10 * i,
                imageUrl: `http://example.com/${i}.jpg`,
                summary: `Summary for game ${i}`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        await Game.insertMany(games);
    });

    it("should return to 5 games for page 1", async () => {
        const res = await request(app).get("/api/games_play/games/infinity");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.games)).toBe(true);
        expect(res.body.games.length).toBe(5);
        expect(res.body.games[0].title).toBe("Game 1");
    });

    it("should return remaining games for page 2", async () => {
        const res = await request(app).get(
            "/api/games_play/games/infinity?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.games.length).toBe(2);
        expect(res.body.games[0].title).toBe("Game 6");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/games_play/games/infinity?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.games.length).toBe(0);
        expect(res.body).toStrictEqual({ games: [] });
    });
});

describe("POST /games", () => {
    beforeEach(async () => {
        await Game.deleteMany();
    });

    it("should create new game and return 201", async () => {
        const newGame = {
            title: "Game One",
            category: "RPG",
            maxLevel: 42,
            imageUrl: "http://example.com/img1.jpg",
            summary: "First test game summary",
        };

        const res = await request(app)
            .post("/api/games_play/games")
            .send(newGame);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Game One");

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectGame = {
            title: "Ga",
            category: "R",
            maxLevel: -10,
            imageUrl: "example.com/img1.jpg",
            summary: "Fi",
        };

        const res = await request(app)
            .post("/api/games_play/games")
            .send(incorectGame);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Game.findOne({ title: "Ga" });
        expect(dbEntry).toBeNull();
    });
});

describe("GET /last_three", () => {
    beforeEach(async () => {
        await Game.deleteMany();

        const games = [];

        for (let i = 1; i <= 5; i++) {
            games.push({
                title: `Game ${i}`,
                category: "Test",
                maxLevel: 10 * i,
                imageUrl: `http://example.com/${i}.jpg`,
                summary: `Summary for game ${i}`,
                _ownerId: validId,
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        await Game.insertMany(games);
    });

    it("should return 3 games", async () => {
        const res = await request(app).get("/api/games_play/games/last_three");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
        expect(res.body[0].title).toBe("Game 1");
    });
});

describe("GET /:gameId", () => {
    let game;
    beforeEach(async () => {
        await Game.deleteMany();

        game = await Game.create({
            title: "Game One",
            category: "RPG",
            maxLevel: 42,
            imageUrl: "http://example.com/img1.jpg",
            summary: "First test game summary",
            _ownerId: validId,
        });
    });

    it("should return one game by id", async () => {
        const res = await request(app).get(`/api/games_play/games/${game._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Game One");
        expect(res.body).toHaveProperty("_id", game._id.toString());
    });

    it("should return 400 if gameId is invalid", async () => {
        const res = await request(app).get("/api/games_play/games/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 404 if game not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/games_play/games/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no game with this id!");
    });
});

describe("PUT /:gameId", () => {
    let game;
    beforeEach(async () => {
        await Game.deleteMany();

        game = await Game.create({
            title: "Game One",
            category: "RPG",
            maxLevel: 42,
            imageUrl: "http://example.com/img1.jpg",
            summary: "First test game summary",
            _ownerId: validId,
        });
    });

    const editedData = {
        title: "Edited Game",
        category: "RPG",
        maxLevel: 42,
        imageUrl: "http://example.com/img1.jpg",
        summary: "First test game summary",
    };

    const fakeData = {
        title: "Ed",
        category: "R",
        maxLevel: -42,
        imageUrl: "example.com/img1.jpg",
        summary: "Fi",
    };

    it("should edit game by id", async () => {
        const res = await request(app)
            .put(`/api/games_play/games/${game._id}`)
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Edited Game");
    });

    it("should return 400 if gameId is invalid", async () => {
        const res = await request(app)
            .get("/api/games_play/games/invalidId")
            .send(editedData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put(`/api/games_play/games/${game._id}`)
            .send(fakeData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if game not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/games_play/games/${nonExistingId}`)
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no game with this id!");
    });
});

describe("DELETE /:gameId", () => {
    let game;
    beforeEach(async () => {
        await Game.deleteMany();

        game = await Game.create({
            title: "Game One",
            category: "RPG",
            maxLevel: 42,
            imageUrl: "http://example.com/img1.jpg",
            summary: "First test game summary",
            _ownerId: validId,
        });
    });

    it("should remove game by id", async () => {
        const res = await request(app).delete(
            `/api/games_play/games/${game._id}`
        );

        expect(res.statusCode).toBe(204);

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if gameId is invalid", async () => {
        const res = await request(app).delete(
            "/api/games_play/games/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if game not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/games_play/games/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Game not found");

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).not.toBeNull();
    });
});
