import express from "express";
import request from "supertest";

import { adminController } from "../../../src/controllers/gamesPlay/adminController.js";

import errorHandler from "../../../src/middlewares/errorHandler.js";
import { authMiddleware } from "../../../src/middlewares/authMiddleware.js";
import { isAdmin } from "../../../src/middlewares/isAdminMiddleware.js";

import { validId } from "../../../src/config/constans.js";

jest.mock("../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "user123" };
        next();
    }),
}));

jest.mock("../../../src/middlewares/isAdminMiddleware.js", () => ({
    isAdmin: jest.fn((req, res, next) => {
        req.user.role = "admin";
        next();
    }),
}));

const mockAuthService = {
    getAllUsers: jest.fn(),
    makeAdmin: jest.fn(),
    getUserById: jest.fn(),
    remove: jest.fn(),
};

const mockGameService = {
    getInfinity: jest.fn(),
    remove: jest.fn(),
};

const mockVisitService = {
    getStats: jest.fn(),
};

const app = express();
app.use(express.json());
app.use(
    "/admin",
    adminController(mockAuthService, mockGameService, mockVisitService)
);
app.use(errorHandler);

describe("Admin Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /games - should return all games", async () => {
        const mockData = [{ title: "Game 1" }];
        mockGameService.getInfinity.mockResolvedValue(mockData);

        const res = await request(app).get("/admin/games");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockGameService.getInfinity).toHaveBeenCalledWith({});
    });

    test("DELETE /games/:gameId - should delete game", async () => {
        mockGameService.remove.mockResolvedValue();

        const res = await request(app).delete(`/admin/games/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockGameService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /games/:gameId - should return 400 for invalid gameId format", async () => {
        const res = await request(app).delete("/admin/games/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("GET /users - should return all users", async () => {
        const mockData = [{ email: "aaa@aaa.aa" }];
        mockAuthService.getAllUsers.mockResolvedValue(mockData);

        const res = await request(app).get("/admin/users");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockAuthService.getAllUsers).toHaveBeenCalledWith({});
    });

    test("GET /users/:userId - should make user admin", async () => {
        const mockData = { _id: validId, role: "admin" };
        mockAuthService.makeAdmin.mockResolvedValue(mockData);

        const res = await request(app).get(`/admin/users/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockAuthService.makeAdmin).toHaveBeenCalledWith(validId);
    });

    test("GET /users/:userId - should return 400 for invalid userId format", async () => {
        const res = await request(app).get("/admin/users/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("GET /users/:userId - should return 404 if user not found", async () => {
        const mockData = { _id: "ValidId" };
        mockAuthService.makeAdmin.mockResolvedValue(mockData);

        const res = await request(app).delete(`/admin/users/${validId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    test("DELETE /user/:userId - should delete user", async () => {
        mockAuthService.getUserById.mockResolvedValue({
            _id: validId,
            role: "user",
        });
        mockAuthService.remove.mockResolvedValue();

        mockAuthService.remove.mockResolvedValue({ validId });

        const res = await request(app).delete(`/admin/users/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockAuthService.getUserById).toHaveBeenCalledWith(validId);
        expect(mockAuthService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /user/:userId - should return 400 for invalid userId format", async () => {
        const res = await request(app).delete("/admin/users/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("DELETE /users/:userId - should return 404 if user not found", async () => {
        mockAuthService.getUserById.mockResolvedValue(null);

        const res = await request(app).delete(`/admin/users/${validId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    test("DELETE /users/:userId - should return 401 if user is admin", async () => {
        mockAuthService.getUserById.mockResolvedValue({
            _id: validId,
            role: "admin",
        });

        const res = await request(app).delete(`/admin/users/${validId}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Cannot delete admin account");
    });

    test("GET /stats - should return filtered stats and total count", async () => {
        const mockResult = {
            filtered: [{ ip: "1.2.3.4", timestamp: String(new Date()) }],
            totalCount: 25,
        };

        mockVisitService.getStats.mockResolvedValue(mockResult);

        const res = await request(app).get("/admin/stats?page=5");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            stats: mockResult.filtered,
            totalCount: 25,
        });
        expect(mockVisitService.getStats).toHaveBeenCalledWith({ page: "5" });
    });

    test("GET /stats - should return stats with default page", async () => {
        const mockResult = {
            filtered: [],
            totalCount: 0,
        };

        mockVisitService.getStats.mockResolvedValue(mockResult);

        const res = await request(app).get("/admin/stats");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            stats: [],
            totalCount: 0,
        });

        expect(mockVisitService.getStats).toHaveBeenCalledWith({});
    });
});
