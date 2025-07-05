import express from "express";
import request from "supertest";

import { recipeController } from "../../../../src/controllers/cookingTogether/recipeController.js";

import { authMiddleware } from "../../../../src/middlewares/authMiddleware.js";
import errorHandler from "../../../../src/middlewares/errorHandler.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/middlewares/authMiddleware.js", () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { _id: "64b2f9d4f8a1e4e1c5a9c123" };
        next();
    }),
}));

jest.mock("../../../../src/middlewares/ownerMiddleware.js", () => ({
    isOwner: () => (req, res, next) => next(),
}));

const mockRecipeService = {
    getAll: jest.fn(),
    create: jest.fn(),
    getAllPaginated: jest.fn(),
    topThree: jest.fn(),
    getByOwnerId: jest.fn(),
    getByLikedId: jest.fn(),
    getById: jest.fn(),
    remove: jest.fn(),
    edit: jest.fn(),
    like: jest.fn(),
};

const app = express();
app.use(express.json());
app.use("/recipes", recipeController(mockRecipeService));
app.use(errorHandler);

describe("Game Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /recipes - should return all recipes", async () => {
        const mockData = [{ title: "Recipe 1" }];
        mockRecipeService.getAll.mockResolvedValue(mockData);

        const res = await request(app).get("/recipes");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockRecipeService.getAll).toHaveBeenCalledWith({});
    });

    test("POST /recipes - should create a recipe", async () => {
        const newRecipe = {
            title: "New Recipe",
            description: "DesertDesert",
            ingredients: "MilkMilkMilk",
            instructions: "BakeBakeBake",
            imageUrl: "https://valid-image.com",
        };
        const createdRecipe = { ...newRecipe, _id: validId };
        mockRecipeService.create.mockResolvedValue(createdRecipe);

        const res = await request(app).post("/recipes").send(newRecipe);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(createdRecipe);
        expect(mockRecipeService.create).toHaveBeenCalledWith(
            newRecipe,
            validId
        );
    });

    test("POST /recipes - should return 400 for invalid data", async () => {
        const invalidRecipe = {
            title: "New",
            description: "Desert",
            ingredients: "Milk",
            instructions: "Bake",
            imageUrl: "invalid-url",
        };

        const res = await request(app).post("/recipes").send(invalidRecipe);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("GET /recipes/paginated - should return paginated recipes", async () => {
        const mockData = {
            items: { title: "Recipe A" },
            totalCount: 2,
            totalPages: 1,
            currentPage: 1,
        };

        mockRecipeService.getAllPaginated.mockResolvedValue(mockData);

        const res = await request(app).get("/recipes/paginated");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
    });

    test("GET /recipes/top-Three - should return 3 recipes", async () => {
        const mockData = [
            { title: "Recipe 1" },
            { title: "Recipe 2" },
            { title: "Recipe 3" },
        ];
        mockRecipeService.topThree.mockResolvedValue(mockData);

        const res = await request(app).get("/recipes/top-three");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockRecipeService.topThree).toHaveBeenCalledWith();
    });

    test("GET /recipes/profileItem - should return logged user recipes", async () => {
        const mockData = {
            items: { title: "Recipe A" },
            totalCount: 2,
            totalPages: 1,
            currentPage: 1,
        };

        mockRecipeService.getByOwnerId.mockResolvedValue(mockData);

        const res = await request(app).get("/recipes/profileItem");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockRecipeService.getByOwnerId).toHaveBeenCalledWith(
            "64b2f9d4f8a1e4e1c5a9c123",
            {}
        );
    });

    test("GET /recipes/profileItem - should return 400 if userId is invalid", async () => {
        authMiddleware.mockImplementationOnce((req, res, next) => {
            req.user = { _id: "invalid-id" };
            next();
        });

        const res = await request(app).get("/recipes/profileItem");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("GET /recipes/profileLiked - should return logged user liked recipes", async () => {
        const mockData = {
            items: { title: "Recipe A" },
            totalCount: 2,
            totalPages: 1,
            currentPage: 1,
        };

        mockRecipeService.getByLikedId.mockResolvedValue(mockData);

        const res = await request(app).get("/recipes/profileLiked");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
        expect(mockRecipeService.getByLikedId).toHaveBeenCalledWith(
            "64b2f9d4f8a1e4e1c5a9c123",
            {}
        );
    });

    test("GET /recipes/profileLiked - should return 400 if userId is invalid", async () => {
        authMiddleware.mockImplementationOnce((req, res, next) => {
            req.user = { _id: "invalid-id" };
            next();
        });

        const res = await request(app).get("/recipes/profileLiked");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("GET /recipes/:recipeId - should return recipe by id", async () => {
        const recipe = { _id: "id1", title: "Recipe 1" };
        mockRecipeService.getById.mockResolvedValue(recipe);

        const res = await request(app).get(`/recipes/${validId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(recipe);
    });

    test("GET /recipes/:resipeId - should return 400 for invalid recipeId format", async () => {
        const res = await request(app).get("/recipes/invalid-id");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
        expect(res.body.message).toBeDefined();
        expect(typeof res.body.message).toBe("string");
    });

    test("DELETE /recipes/:recipeId - should delete recipe", async () => {
        mockRecipeService.remove.mockResolvedValue();

        const res = await request(app).delete(`/recipes/${validId}`);

        expect(res.statusCode).toBe(204);
        expect(mockRecipeService.remove).toHaveBeenCalledWith(validId);
    });

    test("DELETE /recipes/:recipeId - should return 400 for invalid recipeId format", async () => {
        const res = await request(app).delete("/recipes/!@#invalidID");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("PUT /recipes/:recipeId - should edit recipe", async () => {
        const updatedRecipe = {
            title: "New Recipe",
            description: "DesertDesert",
            ingredients: "MilkMilkMilk",
            instructions: "BakeBakeBake",
            imageUrl: "https://valid-image.com",
        };
        mockRecipeService.edit.mockResolvedValue(updatedRecipe);

        const res = await request(app)
            .put(`/recipes/${validId}`)
            .send(updatedRecipe);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(updatedRecipe);
        expect(mockRecipeService.edit).toHaveBeenCalledWith(
            validId,
            updatedRecipe
        );
    });

    test("PUT /recipes/:recipeId - should return 400 for invalid update data", async () => {
        const invalidRecipe = {
            title: "New",
            description: "Desert",
            ingredients: "Milk",
            instructions: "Bake",
            imageUrl: "invalid-url",
        };

        const res = await request(app)
            .put("/recipes/some-id")
            .send(invalidRecipe);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    test("PUT /games/:gameId - should return 400 for invalid recipeId format", async () => {
        const validUpdate = {
            title: "New Recipe",
            description: "DesertDesert",
            ingredients: "MilkMilkMilk",
            instructions: "BakeBakeBake",
            imageUrl: "https://valid-image.com",
        };

        const res = await request(app)
            .put("/recipes/not-objectid")
            .send(validUpdate);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(
            "Id must be a valid MongooseDB ObjectId"
        );
    });

    test("should like a recipe successfully", async () => {
        const likedRecipe = {
            _id: validId,
            title: "Liked Recipe",
            likes: ["64b2f9d4f8a1e4e1c5a9c123"],
        };

        mockRecipeService.like.mockResolvedValue(likedRecipe);

        const res = await request(app).post(`/recipes/${validId}/like`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(likedRecipe);
        expect(mockRecipeService.like).toHaveBeenCalledWith(
            validId,
            "64b2f9d4f8a1e4e1c5a9c123"
        );
    });

    test("should return 400 for invalid recipeId", async () => {
        const res = await request(app).post(`/recipes/invalid-id/like`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/must be a valid MongooseDB ObjectId/);
    });
});
