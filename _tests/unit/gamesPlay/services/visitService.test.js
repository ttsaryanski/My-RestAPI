import { visitService } from "../../../../src/services/gamesPlay/visitService.js";
import Visit from "../../../../src/models/gamesPlay/Visit.js";

jest.mock("../../../../src/models/gamesPlay/Visit.js");

describe("visitService/create", () => {
    const today = new Date();
    const mockStartOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a visit if one does not exist today and return count", async () => {
        Visit.findOne.mockResolvedValue(null);
        Visit.create.mockResolvedValue({});
        Visit.countDocuments.mockResolvedValue(5);

        const count = await visitService.create("home", "1.2.3.4");

        expect(Visit.findOne).toHaveBeenCalledWith({
            page: "home",
            ip: "1.2.3.4",
            timestamp: { $gte: mockStartOfDay },
        });
        expect(Visit.create).toHaveBeenCalledWith({
            page: "home",
            ip: "1.2.3.4",
        });
        expect(Visit.countDocuments).toHaveBeenCalledWith({ page: "home" });
        expect(count).toBe(5);
    });

    it("should NOT create a new visit if already visited today", async () => {
        Visit.findOne.mockResolvedValue({}); // already visited
        Visit.countDocuments.mockResolvedValue(10);

        const count = await visitService.create("home", "1.2.3.4");

        expect(Visit.create).not.toHaveBeenCalled();
        expect(count).toBe(10);
    });
});

describe("visitService/getStats", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return filtered visits and totalCount", async () => {
        const mockVisits = [
            { ip: "1.2.3.4", timestamp: new Date() },
            { ip: "127.0.0.1", timestamp: new Date() },
            { ip: "192.168.0.5", timestamp: new Date() },
            { ip: "::1", timestamp: new Date() },
            { ip: "8.8.8.8", timestamp: new Date() },
        ];

        Visit.find.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockVisits),
        });

        Visit.countDocuments.mockResolvedValue(20);

        const result = await visitService.getStats({ page: 1 });

        expect(result.totalCount).toBe(20);
        expect(result.filtered).toEqual([
            { ip: "1.2.3.4", timestamp: expect.any(Date) },
            { ip: "8.8.8.8", timestamp: expect.any(Date) },
        ]);
    });
});
