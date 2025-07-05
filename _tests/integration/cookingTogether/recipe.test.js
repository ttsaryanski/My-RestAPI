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
import Item from "../../../src/models/cookingTogether/Recipe.js";

import { validId } from "../../../src/config/constans.js";

describe("GET /recipes", () => {
    it("should return empty array", async () => {
        const res = await request(app).get("/api/cooking/recipes");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("should return all existing recipes", async () => {
        await Item.create([
            {
                title: "Recipe One",
                description: "Description1",
                ingredients: "Ingredients1",
                instructions: "Instructions1",
                imageUrl: "http://example.com/img1.jpg",
                _ownerId: new mongoose.Types.ObjectId(),
                likes: [],
            },
            {
                title: "Recipe Two",
                description: "Description2",
                ingredients: "Ingredients2",
                instructions: "Instructions2",
                imageUrl: "http://example.com/img2.jpg",
                _ownerId: new mongoose.Types.ObjectId(),
                likes: [],
            },
        ]);

        const res = await request(app).get("/api/cooking/recipes");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("description");
    });
});

describe("POST /recipes", () => {
    beforeEach(async () => {
        await Item.deleteMany();
    });

    it("should create new recipe and return 201", async () => {
        const newRecipe = {
            title: "Recipe One",
            description: "Description1",
            ingredients: "Ingredients1",
            instructions: "Instructions1",
            imageUrl: "http://example.com/img1.jpg",
        };

        const res = await request(app)
            .post("/api/cooking/recipes")
            .send(newRecipe);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Recipe One");

        const dbEntry = await Item.findOne({ title: "Recipe One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 400 if data is incorect", async () => {
        const incorectRecipe = {
            title: "Re",
            description: "De",
            ingredients: "In",
            instructions: "In",
            imageUrl: "invalidImgUrl",
        };

        const res = await request(app)
            .post("/api/cooking/recipes")
            .send(incorectRecipe);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();

        const dbEntry = await Item.findOne({ title: "Re" });
        expect(dbEntry).toBeNull();
    });
});

describe("GET /recipes/paginated", () => {
    beforeEach(async () => {
        await Item.deleteMany();

        const recipes = [];

        for (let i = 1; i <= 11; i++) {
            recipes.push({
                title: `Recipe ${i}`,
                description: `Description ${i}`,
                ingredients: `Ingredients ${i}`,
                instructions: `Instructions ${i}`,
                imageUrl: `http://example.com/img${i}.jpg`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        await Item.insertMany(recipes);
    });

    it("should return to 9 recipe for page 1", async () => {
        const res = await request(app).get("/api/cooking/recipes/paginated");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(9);
        expect(res.body.items[0].title).toBe("Recipe 1");
    });

    it("should return remaining recipes for page 2", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/paginated?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(2);
        expect(res.body.items[0].title).toBe("Recipe 10");
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/paginated?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(0);
        expect(res.body).toStrictEqual({
            currentPage: 3,
            items: [],
            totalCount: 11,
            totalPages: 2,
        });
    });
});

describe("GET /recipes/top-three", () => {
    beforeEach(async () => {
        await Item.deleteMany();

        const recipes = [];

        for (let i = 1; i <= 5; i++) {
            recipes.push({
                title: `Recipe ${i}`,
                description: `Description ${i}`,
                ingredients: `Ingredients ${i}`,
                instructions: `Instructions ${i}`,
                imageUrl: `http://example.com/img${i}.jpg`,
                likes: Array.from(
                    { length: i },
                    () => new mongoose.Types.ObjectId()
                ),
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        await Item.insertMany(recipes);
    });

    it("should return top-three recipes", async () => {
        const res = await request(app).get("/api/cooking/recipes/top-three");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[0].likes.length).toBe(5);
        expect(res.body[2].likes.length).toBe(3);
    });

    it("should return empty array", async () => {
        await Item.deleteMany();

        const res = await request(app).get("/api/cooking/recipes/top-three");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});

describe("GET /recipes/profileItem", () => {
    beforeEach(async () => {
        await Item.deleteMany();

        const recipes = [];

        for (let i = 1; i <= 7; i++) {
            recipes.push({
                title: `Recipe ${i}`,
                description: `Description ${i}`,
                ingredients: `Ingredients ${i}`,
                instructions: `Instructions ${i}`,
                imageUrl: `http://example.com/img${i}.jpg`,
                _ownerId: validId,
                createdAt: new Date(Date.now() - i * 1000),
            });
        }

        for (let j = 1; j <= 3; j++) {
            recipes.push({
                title: `Recipe ${j + 7}`,
                description: `Description ${j + 7}`,
                ingredients: `Ingredients ${j + 7}`,
                instructions: `Instructions ${j + 7}`,
                imageUrl: `http://example.com/img${j + 7}.jpg`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - (7 + j) * 1000),
            });
        }

        await Item.insertMany(recipes);
    });

    it("should return to 5 recipes for page 1 and _owner is the logged in user", async () => {
        const res = await request(app).get("/api/cooking/recipes/profileItem");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(5);
        expect(
            res.body.items.every((item) => item._ownerId === validId.toString())
        ).toBe(true);
    });

    it("should return remaining recipes for page 2 and _owner is the logged in user", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/profileItem?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(2);
        expect(
            res.body.items.every((item) => item._ownerId === validId.toString())
        ).toBe(true);
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/profileItem?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(0);
        expect(res.body).toStrictEqual({
            currentPage: 3,
            items: [],
            totalCount: 7,
            totalPages: 2,
        });
    });
});

describe("GET /recipes/profileLiked", () => {
    beforeEach(async () => {
        await Item.deleteMany();

        const recipes = [];

        for (let i = 1; i <= 7; i++) {
            recipes.push({
                title: `Recipe ${i}`,
                description: `Description ${i}`,
                ingredients: `Ingredients ${i}`,
                instructions: `Instructions ${i}`,
                imageUrl: `http://example.com/img${i}.jpg`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - i * 1000),
                likes: [validId, new mongoose.Types.ObjectId()],
            });
        }

        for (let j = 1; j <= 3; j++) {
            recipes.push({
                title: `Recipe ${j + 7}`,
                description: `Description ${j + 7}`,
                ingredients: `Ingredients ${j + 7}`,
                instructions: `Instructions ${j + 7}`,
                imageUrl: `http://example.com/img${j + 7}.jpg`,
                _ownerId: new mongoose.Types.ObjectId(),
                createdAt: new Date(Date.now() - (7 + j) * 1000),
                likes: Array.from(
                    { length: j },
                    () => new mongoose.Types.ObjectId()
                ),
            });
        }

        await Item.insertMany(recipes);
    });

    it("should return to 5 recipes for page 1 if the logged in user likes this recipes", async () => {
        const res = await request(app).get("/api/cooking/recipes/profileLiked");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(5);
        expect(
            res.body.items.every((item) =>
                item.likes.some((id) => id.toString() === validId.toString())
            )
        ).toBe(true);
    });

    it("should return remaining recipes for page 2 if the logged in user likes this recipes", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/profileLiked?page=2"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(2);
        expect(
            res.body.items.every((item) =>
                item.likes.some((id) => id.toString() === validId.toString())
            )
        ).toBe(true);
    });

    it("should return empty array if out of range", async () => {
        const res = await request(app).get(
            "/api/cooking/recipes/profileLiked?page=3"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBe(0);
        expect(res.body).toStrictEqual({
            currentPage: 3,
            items: [],
            totalCount: 7,
            totalPages: 2,
        });
    });
});

describe("GET /recipes/:recipeId", () => {
    let recipe;
    beforeEach(async () => {
        await Item.deleteMany();

        recipe = await Item.create({
            title: "Recipe One",
            description: "Description1",
            ingredients: "Ingredients1",
            instructions: "Instructions1",
            imageUrl: "http://example.com/img1.jpg",
            _ownerId: new mongoose.Types.ObjectId(),
        });
    });

    it("should return one recipe by id", async () => {
        const res = await request(app).get(
            `/api/cooking/recipes/${recipe._id}`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Recipe One");
        expect(res.body).toHaveProperty("_id", recipe._id.toString());
    });

    it("should return 400 if recipeId is invalid", async () => {
        const res = await request(app).get("/api/cooking/recipes/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 404 if recipe not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).get(
            `/api/cooking/recipes/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("There is no recipe with this id!");
    });
});

describe("DELETE /recipes/:recipeId", () => {
    let recipe;
    beforeEach(async () => {
        await Item.deleteMany();

        recipe = await Item.create({
            title: "Recipe One",
            description: "Description1",
            ingredients: "Ingredients1",
            instructions: "Instructions1",
            imageUrl: "http://example.com/img1.jpg",
            _ownerId: new mongoose.Types.ObjectId(),
        });
    });

    it("should remove recipe by id", async () => {
        const res = await request(app).delete(
            `/api/cooking/recipes/${recipe._id}`
        );

        expect(res.statusCode).toBe(204);

        const dbEntry = await Item.findOne({ title: "Recipe One" });
        expect(dbEntry).toBeNull();
    });

    it("should return 400 if recipeId is invalid", async () => {
        const res = await request(app).delete("/api/cooking/recipes/invalidId");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");

        const dbEntry = await Item.findOne({ title: "Recipe One" });
        expect(dbEntry).not.toBeNull();
    });

    it("should return 404 if recipe not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).delete(
            `/api/cooking/recipes/${nonExistingId}`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Recipe not found");

        const dbEntry = await Item.findOne({ title: "Recipe One" });
        expect(dbEntry).not.toBeNull();
    });
});

describe("PUT /recipes/:recipeId", () => {
    let recipe;
    beforeEach(async () => {
        await Item.deleteMany();

        recipe = await Item.create({
            title: "Recipe One",
            description: "Description1",
            ingredients: "Ingredients1",
            instructions: "Instructions1",
            imageUrl: "http://example.com/img1.jpg",
            _ownerId: new mongoose.Types.ObjectId(),
        });
    });

    const editedData = {
        title: "Edited recipe",
        description: "Edited Description1",
        ingredients: "Edited Ingredients1",
        instructions: "Edited Instructions1",
        imageUrl: "http://example.com/edited_img1.jpg",
    };

    const fakeData = {
        title: "Ed",
        description: "De",
        ingredients: "Ing",
        instructions: "Ins",
        imageUrl: "example.com/edited_img1.jpg",
    };

    it("should edit recipe by id", async () => {
        const res = await request(app)
            .put(`/api/cooking/recipes/${recipe._id}`)
            .send(editedData);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Edited recipe");
    });

    it("should return 400 if recipeId is invalid", async () => {
        const res = await request(app)
            .put("/api/cooking/recipes/invalidId")
            .send(editedData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 400 if invalid data", async () => {
        const res = await request(app)
            .put(`/api/cooking/recipes/${recipe._id}`)
            .send(fakeData);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBeDefined();
    });

    it("should return 404 if recipe not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .put(`/api/cooking/recipes/${nonExistingId}`)
            .send(editedData);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Recipe not found");
    });
});

describe("POST /recipes/:recipeId/like", () => {
    let recipe;
    beforeEach(async () => {
        await Item.deleteMany();

        recipe = await Item.create({
            title: "Recipe One",
            description: "Description1",
            ingredients: "Ingredients1",
            instructions: "Instructions1",
            imageUrl: "http://example.com/img1.jpg",
            _ownerId: new mongoose.Types.ObjectId(),
            likes: Array.from(
                { length: Math.floor(Math.random() * 10) },
                () => new mongoose.Types.ObjectId()
            ),
        });
    });

    it("should user like a recipe by id", async () => {
        const res = await request(app).post(
            `/api/cooking/recipes/${recipe._id}/like`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Recipe One");
        expect(
            res.body.likes.some((id) => id.toString() === validId.toString())
        ).toBe(true);
    });

    it("should return 400 if recipeId is invalid", async () => {
        const res = await request(app).post(
            "/api/cooking/recipes/invalidId/like"
        );

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Id must be a valid MongooseDB ObjectId");
    });

    it("should return 404 if recipe not found", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();

        const res = await request(app).post(
            `/api/cooking/recipes/${nonExistingId}/like`
        );

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Recipe not found");
    });
});
