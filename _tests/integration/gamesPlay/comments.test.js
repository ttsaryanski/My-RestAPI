import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
import { isAdmin } from "../../../src/middlewares/isAdminMiddleware.js";
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
import Comment from "../../../src/models/gamesPlay/Comment.js";

describe("GET /comments/:gameId", () => {
    beforeEach(async () => {
        await Comment.deleteMany();

        await Comment.create([
            {
                gameId: validId,
                content: "Comment 1 for tests",
                _ownerId: new mongoose.Types.ObjectId(),
            },
            {
                gameId: validId,
                content: "Comment 2 for tests",
                _ownerId: new mongoose.Types.ObjectId(),
            },
            {
                gameId: new mongoose.Types.ObjectId(),
                content: "Comment 3 for tests",
                _ownerId: new mongoose.Types.ObjectId(),
            },
            {
                gameId: new mongoose.Types.ObjectId(),
                content: "Comment 4 for tests",
                _ownerId: new mongoose.Types.ObjectId(),
            },
        ]);
    });

    it("should return all comments by gameId", async () => {
        const res = await request(app).get(
            `/api/games_play/comments/${validId}`
        );

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it("should return empty array if no comments", async () => {
        const res = await request(app).get(
            `/api/games_play/comments/${new mongoose.Types.ObjectId()}`
        );

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return 400 if gameId is invalid", async () => {
        const res = await request(app).get(
            "/api/games_play/comments/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });
});

describe("POST /comments", () => {
    beforeEach(async () => {
        await Comment.deleteMany();
    });

    it("should create new comment and return 201", async () => {
        const newComment = {
            gameId: validId,
            content: "Comment for tests",
        };

        const res = await request(app)
            .post("/api/games_play/comments")
            .send(newComment);

        expect(res.statusCode).toBe(201);
        expect(res.body.content).toBe("Comment for tests");
        expect(res.body.gameId).toBe(validId);

        const dbEntry = await Comment.findOne({ content: "Comment for tests" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectComment = {
            gameId: "invalidId",
            content: "Co",
        };

        const res = await request(app)
            .post("/api/games_play/comments")
            .send(incorectComment);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Comment.findOne({ content: "Co" });
        expect(dbEntry).toBeNull();
    });
});

describe("DELETE /:commentId", () => {
    let comment;
    beforeEach(async () => {
        await Comment.deleteMany();

        comment = await Comment.create({
            gameId: validId,
            content: "Comment for tests",
            _ownerId: new mongoose.Types.ObjectId(),
        });
    });

    it("should remove comment by id", async () => {
        const res = await request(app).delete(
            `/api/games_play/comments/${comment._id}`
        );

        expect(res.statusCode).toBe(204);

        const dbEntry = await Comment.findOne({ content: "Comment for tests" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if commentId is invalid", async () => {
        const res = await request(app).delete(
            "/api/games_play/comments/invalidId"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");

        const dbEntry = await Comment.findOne({ content: "Comment for tests" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if comment not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/games_play/comments/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Comment not found");

        const dbEntry = await Comment.findOne({ content: "Comment for tests" });
        expect(dbEntry).not.toBeNull();
    });
});
