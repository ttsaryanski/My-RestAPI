import { teacherService } from "../../../../src/services/classBook/teacherService.js";

import Teacher from "../../../../src/models/classBook/Teacher.js";

import { CustomError } from "../../../../src/utils/errorUtils/customError.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/models/classBook/Teacher.js");

describe("teacherService/getAll()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Teacher.find() with empty filter when no search", async () => {
        const mockData = [
            { firstName: "teacher 1" },
            { firstName: "teacher 2" },
        ];
        Teacher.find.mockReturnValue(mockData);

        const result = await teacherService.getAll();

        expect(Teacher.find).toHaveBeenCalledWith({});
        expect(result).toEqual(mockData);
    });

    it("should call Teacher.find() with filter by email", async () => {
        const mockData = [{ email: "test@example.com" }];
        Teacher.find.mockReturnValue(mockData);

        const result = await teacherService.getAll({
            email: "test@example.com",
        });

        expect(Teacher.find).toHaveBeenCalledWith({
            email: "test@example.com",
        });
        expect(result).toEqual(mockData);
    });

    it("returns an empty array if there are no results", async () => {
        Teacher.find.mockResolvedValue([]);

        const result = await teacherService.getAll({
            email: "missing@example.com",
        });

        expect(result).toEqual([]);
    });
});

describe("teacherService/create", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new teacher with _ownerId", async () => {
        const inputData = {
            firstName: "Teacher 1",
            email: "teacher@email.com",
        };
        const expectedData = { ...inputData, _ownerId: validId };

        const createdGame = { _id: validId, ...expectedData };

        Teacher.create.mockResolvedValue(createdGame);

        const result = await teacherService.create(inputData, validId);

        expect(Teacher.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdGame);
    });
});

describe("teacherService/getById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the teacher when found", async () => {
        const fakeTeacher = { _id: validId, firstName: "Teacher 1" };

        Teacher.findById.mockResolvedValue(fakeTeacher);

        const result = await teacherService.getById(validId);

        expect(Teacher.findById).toHaveBeenCalledWith(validId);
        expect(result).toEqual(fakeTeacher);
    });

    it("should throw CustomError when teacher is not found", async () => {
        Teacher.findById.mockResolvedValue(null);

        try {
            await teacherService.getById("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no teacher with this id!");
        }
    });
});

describe("teacherService/edit", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("update teacher with plain data (no classes)", async () => {
        const expected = {
            _id: validId,
            firstName: "Ivan",
            dateUpdate: expect.any(Number),
        };

        Teacher.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await teacherService.edit(validId, {
            firstName: "Ivan",
        });

        expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                firstName: "Ivan",
                dateUpdate: expect.any(Number),
            }),
            { runValidators: true, new: true }
        );
        expect(result).toEqual(expected);
    });

    it("adds class to the list", async () => {
        const expected = {
            _id: validId,
            clss: ["5A"],
            dateUpdate: expect.any(Number),
        };

        Teacher.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await teacherService.edit(validId, {
            clssToAdd: "5A",
        });

        expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                $push: { clss: "5A" },
                dateUpdate: expect.any(Number),
            }),
            { runValidators: true, new: true }
        );
        expect(result).toEqual(expected);
    });

    it("removes a class from the list", async () => {
        const expected = {
            _id: validId,
            clss: [],
            dateUpdate: expect.any(Number),
        };

        Teacher.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await teacherService.edit(validId, {
            clssToRemove: "5A",
        });

        expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                $pull: { clss: "5A" },
                dateUpdate: expect.any(Number),
            }),
            { runValidators: true, new: true }
        );
        expect(result).toEqual(expected);
    });

    it("adds and removes a class at the same time", async () => {
        const input = {
            clssToAdd: "5A",
            clssToRemove: "4B",
        };
        const expected = {
            _id: validId,
            clss: ["5A"],
            dateUpdate: expect.any(Number),
        };

        Teacher.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await teacherService.edit(validId, input);

        expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(
            validId,
            expect.objectContaining({
                $push: { clss: "5A" },
                $pull: { clss: "4B" },
                dateUpdate: expect.any(Number),
            }),
            { runValidators: true, new: true }
        );
        expect(result).toEqual(expected);
    });
});
