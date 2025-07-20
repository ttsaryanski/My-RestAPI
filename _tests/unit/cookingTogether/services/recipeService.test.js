import { recipeService } from "../../../../src/services/cookingTogether/recipeService.js";

import Item from "../../../../src/models/cookingTogether/Recipe.js";

import { CustomError } from "../../../../src/utils/errorUtils/customError.js";

jest.mock("../../../../src/models/cookingTogether/Recipe.js");

describe("recipeService/getAll()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Recipe.find() with empty filter when no search", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
        };
        Item.find.mockReturnValue(mockQuery);

        await recipeService.getAll();

        expect(Item.find).toHaveBeenCalledWith({});
        expect(mockQuery.sort).toHaveBeenCalledWith({ dateUpdate: -1 });
    });

    it("should use search term if provided", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
        };
        Item.find.mockReturnValue(mockQuery);

        await recipeService.getAll({ search: "test" });

        expect(Item.find).toHaveBeenCalledWith({
            title: { $regex: "test", $options: "i" },
        });
    });

    it("should call limit() if query.limit is provided", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ title: "Recipe 1" }]),
        };
        Item.find.mockReturnValue(mockQuery);

        const result = await recipeService.getAll({ limit: "5" });

        expect(mockQuery.limit).toHaveBeenCalledWith(5);
        expect(result).toEqual([{ title: "Recipe 1" }]);
    });

    it("should return recipe after applying query", async () => {
        const fakeRecipe = [{ title: "Recipe A" }, { title: "Recipe B" }];
        const mockQuery = {
            sort: jest.fn().mockResolvedValue(fakeRecipe),
        };
        Item.find.mockReturnValue(mockQuery);

        const result = await recipeService.getAll();

        expect(result).toEqual(fakeRecipe);
    });
});

describe("recipeService/getAllPaginated", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated recipes", async () => {
        const fakerecipes = [{ title: "Recipe 1" }, { title: "Recipe 2" }];
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(fakerecipes),
        };

        Item.find.mockReturnValue(mockQuery);
        Item.countDocuments.mockResolvedValue(20);

        const result = await recipeService.getAllPaginated({ page: 1 });

        expect(Item.find).toHaveBeenCalled();
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(9);

        expect(result).toEqual({
            items: fakerecipes,
            currentPage: 1,
            totalPages: 3,
            totalCount: 20,
        });
    });

    it("should calculate skip correctly for page 3", async () => {
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        Item.find.mockReturnValue(mockQuery);
        Item.countDocuments.mockResolvedValue(0);

        await recipeService.getAllPaginated({ page: 3 });

        expect(mockQuery.skip).toHaveBeenCalledWith(18);
    });

    it("should use default page = 1 if not provided", async () => {
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        Item.find.mockReturnValue(mockQuery);
        Item.countDocuments.mockResolvedValue(0);

        await recipeService.getAllPaginated({});

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });
});

describe("recipeService/create", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new recipe with _ownerId", async () => {
        const inputData = { title: "Test Recipe", description: "Desert" };
        const userId = "user123";
        const expectedData = { ...inputData, _ownerId: userId };

        const createdRecipe = { _id: "game123", ...expectedData };

        Item.create.mockResolvedValue(createdRecipe);

        const result = await recipeService.create(inputData, userId);

        expect(Item.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdRecipe);
    });
});

describe("recipeService/getById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the recipe when found", async () => {
        const recipeId = "abc123";
        const fakeRecipe = { _id: recipeId, title: "Test Game" };

        Item.findById.mockResolvedValue(fakeRecipe);

        const result = await recipeService.getById(recipeId);

        expect(Item.findById).toHaveBeenCalledWith(recipeId);
        expect(result).toEqual(fakeRecipe);
    });

    it("should throw CustomError when game is not found", async () => {
        Item.findById.mockResolvedValue(null);

        try {
            await recipeService.getById("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no recipe with this id!");
        }
    });
});

describe("recipeService/remove", () => {
    it("should delete a recipe when it exists", async () => {
        const recipeId = "existing-recipe-id";
        Item.findByIdAndDelete.mockResolvedValue({ _id: recipeId });

        await expect(recipeService.remove(recipeId)).resolves.toBeUndefined();
        expect(Item.findByIdAndDelete).toHaveBeenCalledWith(recipeId);
    });

    it("should throw CustomError when recipe not found", async () => {
        Item.findByIdAndDelete.mockResolvedValue(null);

        try {
            await recipeService.remove("nonexistent-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("Recipe not found!");
        }
    });
});

describe("recipeService/edit", () => {
    it("should update and return the updated recipe", async () => {
        const recipeId = "some-recipe-id";
        const updateData = { title: "New Title" };
        const updatedRecipe = { _id: recipeId, ...updateData };

        Item.findByIdAndUpdate.mockResolvedValue(updatedRecipe);

        const result = await recipeService.edit(recipeId, updateData);

        expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
            recipeId,
            updateData,
            {
                runValidators: true,
                new: true,
            }
        );
        expect(result).toEqual(updatedRecipe);
    });

    it("should throw CustomError if no recipe is found to update", async () => {
        Item.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await recipeService.edit("nonexistent-id", { title: "test" });
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
        }
    });
});

describe("recipeService/like", () => {
    it("should call findByIdAndUpdate with $addToSet to add userId to likes", async () => {
        const mockItemId = "abc123";
        const mockUserId = "user456";
        const mockResult = { _id: mockItemId, likes: [mockUserId] };

        Item.findByIdAndUpdate.mockResolvedValue(mockResult);

        const result = await recipeService.like(mockItemId, mockUserId);

        expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
            mockItemId,
            { $addToSet: { likes: mockUserId } },
            { new: true }
        );
        expect(result).toBe(mockResult);
    });

    it("should throw CustomError if no recipe is found to like", async () => {
        Item.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await recipeService.like("nonexistent-id", { title: "test" });
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
        }
    });
});

describe("recipeService/topThree", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return top 3 recipes sorted by likes and dateUpdate", async () => {
        const mockResult = [
            {
                _id: "1",
                title: "Recipe A",
                likes: ["u1", "u2"],
                dateUpdate: new Date("2024-05-01"),
            },
            {
                _id: "2",
                title: "Recipe B",
                likes: ["u1"],
                dateUpdate: new Date("2024-05-02"),
            },
            {
                _id: "3",
                title: "Recipe C",
                likes: ["u1"],
                dateUpdate: new Date("2024-04-01"),
            },
        ];

        Item.aggregate.mockReturnValue(mockResult);

        const result = await recipeService.topThree();

        expect(Item.aggregate).toHaveBeenCalledWith([
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                },
            },
            {
                $sort: {
                    likesCount: -1,
                    dateUpdate: -1,
                },
            },
            {
                $limit: 3,
            },
        ]);
        expect(result).toEqual(mockResult);
    });
});

describe("recipeService/getByOwnerId", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated recipes for a given ownerId", async () => {
        const mockOwnerId = "owner123";
        const mockQuery = { page: "2", limit: "3" };
        const mockItems = [
            { _id: "1", title: "Item 1" },
            { _id: "2", title: "Item 2" },
            { _id: "3", title: "Item 3" },
        ];
        const mockCount = 10;

        const findMock = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockItems),
        };
        Item.find.mockReturnValue(findMock);
        Item.countDocuments.mockResolvedValue(mockCount);

        const result = await recipeService.getByOwnerId(mockOwnerId, mockQuery);

        expect(Item.find).toHaveBeenCalledWith({ _ownerId: mockOwnerId });
        expect(findMock.skip).toHaveBeenCalledWith(3);
        expect(findMock.limit).toHaveBeenCalledWith(3);
        expect(Item.countDocuments).toHaveBeenCalledWith({
            _ownerId: mockOwnerId,
        });

        expect(result).toEqual({
            items: mockItems,
            totalCount: mockCount,
            totalPages: Math.ceil(mockCount / 3),
            currentPage: 2,
        });
    });
});

describe("recipeService/getByLikedId", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated items for a given likedId", async () => {
        const mockLikedId = "liked123";
        const mockQuery = { page: "2", limit: "3" };
        const mockItems = [
            { _id: "1", title: "Item 1" },
            { _id: "2", title: "Item 2" },
            { _id: "3", title: "Item 3" },
        ];
        const mockCount = 10;

        const findMock = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockItems),
        };
        Item.find.mockReturnValue(findMock);
        Item.countDocuments.mockResolvedValue(mockCount);

        const result = await recipeService.getByLikedId(mockLikedId, mockQuery);

        expect(Item.find).toHaveBeenCalledWith({ likes: mockLikedId });
        expect(findMock.skip).toHaveBeenCalledWith(3);
        expect(findMock.limit).toHaveBeenCalledWith(3);
        expect(Item.countDocuments).toHaveBeenCalledWith({
            likes: mockLikedId,
        });

        expect(result).toEqual({
            items: mockItems,
            totalCount: mockCount,
            totalPages: Math.ceil(mockCount / 3),
            currentPage: 2,
        });
    });
});
