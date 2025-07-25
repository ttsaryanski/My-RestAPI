import { classService } from "../../../../src/services/classBook/clssService.js";

import Clss from "../../../../src/models/classBook/Clss.js";

import { CustomError } from "../../../../src/utils/errorUtils/customError.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/models/classBook/Clss.js");

describe("classService/getAll()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Clss.find() with empty filter when no search", async () => {
        Clss.find.mockReturnValue({});

        await classService.getAll();

        expect(Clss.find).toHaveBeenCalledWith({});
    });

    it("should use search term if provided", async () => {
        Clss.find.mockReturnValue({});

        await classService.getAll({ search: "test" });

        expect(Clss.find).toHaveBeenCalledWith({
            title: { $regex: "test", $options: "i" },
        });
    });

    it("should call limit() if query.limit is provided", async () => {
        const mockQuery = {
            limit: jest.fn().mockResolvedValue([{ title: "Class 1" }]),
        };
        Clss.find.mockReturnValue(mockQuery);

        const result = await classService.getAll({ limit: "5" });

        expect(mockQuery.limit).toHaveBeenCalledWith(5);
        expect(result).toEqual([{ title: "Class 1" }]);
    });

    it("should handle invalid query.limit gracefully", async () => {
        const mockQuery = {
            limit: jest.fn(),
        };
        Clss.find.mockReturnValue([]);

        const result = await classService.getAll({ limit: "invalid" });

        expect(mockQuery.limit).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});

describe("classService/getAllPaginated", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated classes", async () => {
        const fakeStudents = [{ title: "Class 1" }, { title: "Class 2" }];
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(fakeStudents),
        };

        Clss.find.mockReturnValue(mockQuery);
        Clss.countDocuments.mockResolvedValue(20);

        const result = await classService.getAllPaginated({ page: 1 });

        expect(Clss.find).toHaveBeenCalled();
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(9);

        expect(result).toEqual({
            classes: fakeStudents,
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

        Clss.find.mockReturnValue(mockQuery);
        Clss.countDocuments.mockResolvedValue(0);

        await classService.getAllPaginated({ page: 3 });

        expect(mockQuery.skip).toHaveBeenCalledWith(18);
    });

    it("should use default page = 1 if not provided", async () => {
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        Clss.find.mockReturnValue(mockQuery);
        Clss.countDocuments.mockResolvedValue(0);

        await classService.getAllPaginated({});

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });
});

describe("classService/create", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new class with _createdBy", async () => {
        const inputData = {
            title: "Class 1",
        };
        const expectedData = { ...inputData, _createdBy: validId };

        const createdClass = { _id: validId, ...expectedData };

        Clss.create.mockResolvedValue(createdClass);

        const result = await classService.create(inputData, validId);

        expect(Clss.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdClass);
    });
});

describe("classService/getById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the class when found", async () => {
        const fakeClass = { _id: validId, title: "Title 1" };

        Clss.findById.mockResolvedValue(fakeClass);

        const result = await classService.getById(validId);

        expect(Clss.findById).toHaveBeenCalledWith(validId);
        expect(result).toEqual(fakeClass);
    });

    it("should throw CustomError when class is not found", async () => {
        Clss.findById.mockResolvedValue(null);

        try {
            await classService.getById("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no class with this id!");
        }
    });
});

describe("classService/getByIdPopulate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the class with populate teacher and students", async () => {
        const mockPopulatedClass = {
            _id: validId,
            teacher: "teacherId",
            students: ["studentId"],
        };

        const mockPopulate2 = jest.fn().mockResolvedValue(mockPopulatedClass);
        const mockPopulate1 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate2 });
        const mockFind = { populate: mockPopulate1 };

        Clss.findById.mockReturnValue(mockFind);

        const result = await classService.getByIdPopulate(validId);

        expect(Clss.findById).toHaveBeenCalledWith(validId);
        expect(mockPopulate1).toHaveBeenCalledWith("teacher");
        expect(mockPopulate2).toHaveBeenCalledWith("students");

        expect(result).toEqual(mockPopulatedClass);
    });

    it("should throw CustomError when class is not found", async () => {
        const mockPopulate2 = jest.fn().mockResolvedValue(null);
        const mockPopulate1 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate2 });
        const mockFind = { populate: mockPopulate1 };

        Clss.findById.mockReturnValue(mockFind);

        try {
            await classService.getByIdPopulate("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no class with this id!");
        }
    });
});

describe("classService/remove", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should delete a class when it exists", async () => {
        Clss.findByIdAndDelete.mockResolvedValue({ _id: validId });

        await expect(classService.remove(validId)).resolves.toBeUndefined();
        expect(Clss.findByIdAndDelete).toHaveBeenCalledWith(validId);
    });

    it("should throw CustomError when class not found", async () => {
        Clss.findByIdAndDelete.mockResolvedValue(null);

        try {
            await classService.remove("nonexistent-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("Class not found!");
        }
    });
});

describe("classService/edit", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("update class", async () => {
        const input = { title: "Class 1" };
        const expected = {
            _id: validId,
            title: "Class 1",
            dateUpdate: expect.any(Number),
        };

        Clss.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await classService.edit(validId, input);

        expect(Clss.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                title: "Class 1",
                dateUpdate: expect.any(Number),
            }),
            { runValidators: true, new: true }
        );
        expect(result).toEqual(expected);
    });

    it("should throw CustomError if class does not exist", async () => {
        Clss.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await classService.edit(validId, { title: "Class 1" });
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
        }
    });
});
