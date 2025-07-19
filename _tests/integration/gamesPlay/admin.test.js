import { validId } from "../../../src/config/constans.js";
const mockUserId = validId;
jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { _id: mockUserId, role: "admin" };
        req.isAuthenticated = true;
        next();
    },
}));
jest.mock("../../../src/middlewares/isAdminMiddleware.js", () => ({
    isAdmin: (_req, _res, next) => next(),
}));

import request from "supertest";
import mongoose from "mongoose";

import app from "../../../src/app.js";
import Game from "../../../src/models/gamesPlay/Game.js";
import UserGames from "../../../src/models/gamesPlay/User.js";
import Visit from "../../../src/models/gamesPlay/Visit.js";

describe("GET /admin/games", () => {
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
        const res = await request(app).get("/api/games_play/admin/games");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.games)).toBe(true);
        expect(res.body.games.length).toBe(5);
        expect(res.body.games[0].title).toBe("Game 1");
    });

    it("should return remaining games for page 2", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/games?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.games.length).toBe(2);
        expect(res.body.games[0].title).toBe("Game 6");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/games?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.games.length).toBe(0);
        expect(res.body).toStrictEqual({ games: [] });
    });
});

describe("DELETE /admin/games/:gameId", () => {
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
            `/api/games_play/admin/games/${game._id}`
        );

        expect(res.statusCode).toBe(204);

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if gameId is invalid", async () => {
        const res = await request(app).delete(
            "/api/games_play/admin/games/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if Game not found!", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/games_play/admin/games/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Game not found!");

        const dbEntry = await Game.findOne({ title: "Game One" });
        expect(dbEntry).not.toBeNull();
    });
});

describe("GET /admin/users", () => {
    beforeEach(async () => {
        const users = [];

        for (let i = 1; i <= 7; i++) {
            users.push({
                email: `${i}test@email.com`,
                password: `Password${i}`,
                role: "admin",
                dateCreated: new Date(Date.now() - i * 1000),
            });
        }

        await UserGames.insertMany(users);
    });

    it("should return to 5 users for page 1", async () => {
        const res = await request(app).get("/api/games_play/admin/users");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.users.length).toBe(5);
        expect(res.body.users[0].email).toBe("7test@email.com");
    });

    it("should return remaining users for page 2", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/users?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.users.length).toBe(2);
        expect(res.body.users[0].email).toBe("2test@email.com");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/users?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.users.length).toBe(0);
        expect(res.body).toStrictEqual({ users: [] });
    });
});

describe("PATCH /admin/users/:userId", () => {
    let user;
    beforeEach(async () => {
        await UserGames.deleteMany();

        user = await UserGames.create({
            email: "test@email.com",
            password: "Password",
            role: "user",
            dateCreated: new Date(Date.now()),
        });
    });

    it("should edit user by id and make her role admin", async () => {
        const res = await request(app).patch(
            `/api/games_play/admin/users/${user._id}`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.role).toBe("admin");
    });

    it("should return 400 if userId is invalid", async () => {
        const res = await request(app).patch(
            "/api/games_play/admin/users/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );
    });

    it("should return 404 if user not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).patch(
            `/api/games_play/admin/users/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });
});

describe("DELETE /admin/users/:userId", () => {
    let users;
    beforeEach(async () => {
        await UserGames.deleteMany();

        users = await UserGames.create([
            {
                email: "test1@email.com",
                password: "Password1",
                role: "user",
                dateCreated: new Date(Date.now()),
            },
            {
                email: "test2@email.com",
                password: "Password2",
                role: "admin",
                dateCreated: new Date(Date.now()),
            },
        ]);
    });

    it("should remove user by id", async () => {
        const res = await request(app).delete(
            `/api/games_play/admin/users/${users[0]._id}`
        );

        expect(res.statusCode).toBe(204);

        const dbEntry = await UserGames.findOne({ email: "test1@email.com" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if userId is invalid", async () => {
        const res = await request(app).delete(
            "/api/games_play/admin/users/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            "Id must be a valid MongooseDB ObjectId!"
        );

        const dbEntry = await UserGames.findOne({ email: "test1@email.com" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if user not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/games_play/admin/users/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no user with this id!");

        const dbEntry = await UserGames.findOne({ email: "test1@email.com" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 403 if user is admin", async () => {
        const res = await request(app).delete(
            `/api/games_play/admin/users/${users[1]._id}`
        );

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Cannot delete admin account");

        const dbEntry = await UserGames.findOne({ email: "test2@email.com" });
        expect(dbEntry).not.toBeNull();
    });
});

describe("GET /admin/stats", () => {
    beforeEach(async () => {
        const visits = [];

        for (let i = 1; i <= 7; i++) {
            visits.push({
                page: "home",
                ip: `37.25.35.21${i}`,
                timestamp: new Date(Date.now() - i * 1000),
            });
        }

        await Visit.insertMany(visits);
    });

    it("should return to 5 visits for page 1", async () => {
        const res = await request(app).get("/api/games_play/admin/stats");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.stats)).toBe(true);
        expect(res.body.stats.length).toBe(5);
        expect(res.body.stats[0].ip).toBe("37.25.35.211");
    });

    it("should return remaining visits for page 2", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/stats?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.stats.length).toBe(2);
        expect(res.body.stats[0].ip).toBe("37.25.35.216");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/games_play/admin/stats?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.stats.length).toBe(0);
        expect(res.body).toStrictEqual({ stats: [], totalCount: 7 });
    });
});
