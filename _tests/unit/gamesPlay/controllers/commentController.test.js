import express from "express";
import request from "supertest";

import { commentController } from "../../../../src/controllers/gamesPlay/commentController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import { isAdmin } from "../../../../src/middlewares/isAdminMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

jest.mock("../../../../src/middlewares/isAdminMiddleware.js", () => ({
    isAdmin: jest.fn((req, res, next) => {
        req.user.role = "admin";
        next();
    }),
}));

const mockCommenttService = {
    getAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/comments", commentController(mockCommenttService));
app.use(errorHandler);

describe("Comment Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /comments - should return all comments", async () => {
        const mockData = [{ content: "Comment 1" }];
        mockCommenttService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get(`/comments/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockCommenttService.getAll).toHaveBeenCalledWith(validId);
    });

    test("GET /comments - should return 400 for invalid commentId format", async () => {
        const res = await request(app).get("/comments/invalid-id");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("POST /comments - should create a comment", async () => {
        const newComment = {
            content: "New comment",
            gameId: validId,
        };
        const createdComment = { ...newComment, _id: validId };
        mockCommenttService.create.mockResolvedValue(createdComment);

        const res = await request(app).post("/comments").send(newComment);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdComment);
        expect(mockCommenttService.create).toHaveBeenCalledWith(
            newComment,
            validId
        );
    });

    test("POST /comments - should fail with invalid comment data - missing content", async () => {
        const invalidData = { gameId: validId };

        const res = await request(app).post("/comments").send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch("Comment is required!");
    });

    test("POST /comments - should fail with invalid comment data - missing gameId", async () => {
        const invalidData = { content: "New comment" };

        const res = await request(app).post("/comments").send(invalidData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch("GameId is required!");
    });

    test("DELETE /coments/:commentId - should delete comment", async () => {
        mockCommenttService.remove.mockResolvedValue();

        const res = await request(app).delete(`/comments/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockCommenttService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /comments/:gameId - should return 400 for invalid commetId format", async () => {
        const res = await request(app).delete("/comments/invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });
});
