import { jest } from "@jest/globals";

import { gameService } from "../../../src/services/gamesPlay/gameService.js";
import Game from "../../../src/models/gamesPlay/Game.js";
import { CustomError } from "../../../src/utils/errorUtils/customError.js";

jest.mock("../../../src/models/gamesPlay/Game.js");

describe("gameService.getAll()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Game.find() with empty filter when no search", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
        };
        Game.find.mockReturnValue(mockQuery);

        await gameService.getAll();

        expect(Game.find).toHaveBeenCalledWith({});
        expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockQuery.populate).toHaveBeenCalledWith("_ownerId");
    });

    it("should use search term if provided", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
        };
        Game.find.mockReturnValue(mockQuery);

        await gameService.getAll({ search: "test" });

        expect(Game.find).toHaveBeenCalledWith({
            title: { $regex: "test", $options: "i" },
        });
    });

    it("should call limit() if query.limit is provided", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ title: "Game1" }]),
        };
        Game.find.mockReturnValue(mockQuery);

        const result = await gameService.getAll({ limit: "5" });

        expect(mockQuery.limit).toHaveBeenCalledWith(5);
        expect(result).toEqual([{ title: "Game1" }]);
    });

    it("should return games after applying query", async () => {
        const fakeGames = [{ title: "Game A" }, { title: "Game B" }];
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(fakeGames),
        };
        Game.find.mockReturnValue(mockQuery);

        const result = await gameService.getAll();

        expect(result).toEqual(fakeGames);
    });
});

describe("gameService.getInfinity", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated games", async () => {
        const fakeGames = [{ title: "Game 1" }, { title: "Game 2" }];
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue(fakeGames),
        };

        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(20); // бройката е без значение тук

        const result = await gameService.getInfinity({ page: 1 });

        expect(Game.find).toHaveBeenCalled();
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(5);
        expect(mockQuery.populate).toHaveBeenCalledWith("_ownerId");

        expect(result).toEqual({ games: fakeGames });
    });

    it("should calculate skip correctly for page 3", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([]),
        };

        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(0);

        await gameService.getInfinity({ page: 3 });

        expect(mockQuery.skip).toHaveBeenCalledWith(10); // (3 - 1) * 5
    });

    it("should use default page = 1 if not provided", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([]),
        };

        Game.find.mockReturnValue(mockQuery);
        Game.countDocuments.mockResolvedValue(0);

        await gameService.getInfinity({});

        expect(mockQuery.skip).toHaveBeenCalledWith(0); // default page = 1 → skip = 0
    });
});

describe("gameService.lastThree", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return last 3 games sorted by createdAt descending", async () => {
        const fakeGames = [
            { title: "Game 1" },
            { title: "Game 2" },
            { title: "Game 3" },
        ];

        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(fakeGames),
        };

        Game.find.mockReturnValue(mockQuery);

        const result = await gameService.lastThree();

        expect(Game.find).toHaveBeenCalled();
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockQuery.limit).toHaveBeenCalledWith(3);
        expect(result).toEqual(fakeGames);
    });
});

describe("gameService.create", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new game with _ownerId", async () => {
        const inputData = { title: "Test Game", category: "Action" };
        const userId = "user123";
        const expectedData = { ...inputData, _ownerId: userId };

        const createdGame = { _id: "game123", ...expectedData };

        Game.create.mockResolvedValue(createdGame);

        const result = await gameService.create(inputData, userId);

        expect(Game.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdGame);
    });
});

describe("gameService.getById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the game when found", async () => {
        const gameId = "abc123";
        const fakeGame = { _id: gameId, title: "Test Game" };

        Game.findById.mockResolvedValue(fakeGame);

        const result = await gameService.getById(gameId);

        expect(Game.findById).toHaveBeenCalledWith(gameId);
        expect(result).toEqual(fakeGame);
    });

    it("should throw CustomError when game is not found", async () => {
        Game.findById.mockResolvedValue(null);

        try {
            await gameService.getById("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no game with this id!");
        }
    });
});

describe("gameService.remove", () => {
    it("should delete a game when it exists", async () => {
        const gameId = "existing-game-id";
        Game.findByIdAndDelete.mockResolvedValue({ _id: gameId });

        await expect(gameService.remove(gameId)).resolves.toBeUndefined();
        expect(Game.findByIdAndDelete).toHaveBeenCalledWith(gameId);
    });

    it("should throw CustomError when game not found", async () => {
        Game.findByIdAndDelete.mockResolvedValue(null);

        try {
            await gameService.remove("nonexistent-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("Game not found");
        }
    });
});

describe("gameService.edit", () => {
    it("should update and return the updated game", async () => {
        const gameId = "some-game-id";
        const updateData = { title: "New Title" };
        const updatedGame = { _id: gameId, ...updateData };

        Game.findByIdAndUpdate.mockResolvedValue(updatedGame);

        const result = await gameService.edit(gameId, updateData);

        expect(Game.findByIdAndUpdate).toHaveBeenCalledWith(
            gameId,
            updateData,
            {
                runValidators: true,
                new: true,
            }
        );
        expect(result).toEqual(updatedGame);
    });

    it("should throw CustomError if no game is found to update", async () => {
        Game.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await gameService.edit("nonexistent-id", { title: "test" });
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
        }
    });
});
