import { commentService } from "../../../src/services/gamesPlay/commentService.js";
import Comment from "../../../src/models/gamesPlay/Comment.js";

jest.mock("../../../src/models/gamesPlay/Comment.js");

describe("commentService/getAll", () => {
    it("should return sorted comments populated with _ownerId", async () => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([{ content: "Test" }]),
        };

        Comment.find.mockReturnValue(mockQuery);

        const result = await commentService.getAll("game123");

        expect(Comment.find).toHaveBeenCalledWith({ gameId: "game123" });
        expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(mockQuery.populate).toHaveBeenCalledWith("_ownerId");
        expect(result).toEqual([{ content: "Test" }]);
    });
});
