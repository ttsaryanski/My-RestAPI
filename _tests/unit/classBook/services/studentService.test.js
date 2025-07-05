import { studentService } from "../../../../src/services/classBook/studentService.js";

import Student from "../../../../src/models/classBook/Student.js";

import { CustomError } from "../../../../src/utils/errorUtils/customError.js";

import { validId } from "../../../../src/config/constans.js";

jest.mock("../../../../src/models/classBook/Student.js");

describe("studentService/getAll()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Student.find() without limit", async () => {
        const mockQuery = [
            { firstName: "Student 1" },
            { firstName: "Student 2" },
        ];
        Student.find.mockReturnValue(mockQuery);

        const result = await studentService.getAll();

        expect(Student.find).toHaveBeenCalledWith();
        expect(result).toEqual(mockQuery);
    });

    it("should call limit() if query.limit is provided", async () => {
        const mockQuery = {
            limit: jest.fn().mockResolvedValue([{ firstName: "Student 1" }]),
        };
        Student.find.mockReturnValue(mockQuery);

        const result = await studentService.getAll({ limit: "5" });

        expect(mockQuery.limit).toHaveBeenCalledWith(5);
        expect(result).toEqual([{ firstName: "Student 1" }]);
    });

    it("should handle invalid query.limit gracefully", async () => {
        const mockQuery = {
            limit: jest.fn(),
        };
        Student.find.mockReturnValue([]);

        const result = await studentService.getAll({ limit: "invalid" });

        expect(mockQuery.limit).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it("should return empty array if no students", async () => {
        Student.find.mockReturnValue([]);

        const result = await studentService.getAll();

        expect(result).toEqual([]);
    });
});

describe("studentService/getAllPaginated", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated students", async () => {
        const fakeStudents = [
            { firstName: "Student 1" },
            { firstName: "Student 2" },
        ];
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(fakeStudents),
        };

        Student.find.mockReturnValue(mockQuery);
        Student.countDocuments.mockResolvedValue(20);

        const result = await studentService.getAllPaginated({ page: 1 });

        expect(Student.find).toHaveBeenCalled();
        expect(mockQuery.skip).toHaveBeenCalledWith(0);
        expect(mockQuery.limit).toHaveBeenCalledWith(9);

        expect(result).toEqual({
            students: fakeStudents,
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

        Student.find.mockReturnValue(mockQuery);
        Student.countDocuments.mockResolvedValue(0);

        await studentService.getAllPaginated({ page: 3 });

        expect(mockQuery.skip).toHaveBeenCalledWith(18);
    });

    it("should use default page = 1 if not provided", async () => {
        const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        Student.find.mockReturnValue(mockQuery);
        Student.countDocuments.mockResolvedValue(0);

        await studentService.getAllPaginated({});

        expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });
});

describe("studentService/create", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new student with _ownerId", async () => {
        const inputData = {
            firstName: "Student 1",
            email: "student@email.com",
        };
        const expectedData = { ...inputData, _ownerId: validId };

        const createdStudent = { _id: validId, ...expectedData };

        Student.create.mockResolvedValue(createdStudent);

        const result = await studentService.create(inputData, validId);

        expect(Student.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdStudent);
    });
});

describe("studentService/getById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the student when found", async () => {
        const fakeStudent = { _id: validId, firstName: "Student 1" };

        Student.findById.mockResolvedValue(fakeStudent);

        const result = await studentService.getById(validId);

        expect(Student.findById).toHaveBeenCalledWith(validId);
        expect(result).toEqual(fakeStudent);
    });

    it("should throw CustomError when teacher is not found", async () => {
        Student.findById.mockResolvedValue(null);

        try {
            await studentService.getById("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no student with this id!");
        }
    });
});

describe("studentService/getByIdPopulate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the student with populate grade, class and teacher", async () => {
        const mockPopulatedStudent = {
            _id: validId,
            grades: [
                {
                    score: 5,
                    class: { title: "Math" },
                    teacher: { firstName: "Ivan" },
                },
            ],
        };

        const mockPopulate3 = jest.fn().mockResolvedValue(mockPopulatedStudent);
        const mockPopulate2 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate3 });
        const mockPopulate1 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate2 });
        const mockFind = { populate: mockPopulate1 };

        Student.findById.mockReturnValue(mockFind);

        const result = await studentService.getByIdPopulate(validId);

        expect(Student.findById).toHaveBeenCalledWith(validId);
        expect(mockPopulate1).toHaveBeenCalledWith("grades");
        expect(mockPopulate2).toHaveBeenCalledWith("grades.class");
        expect(mockPopulate3).toHaveBeenCalledWith("grades.teacher");

        expect(result).toEqual(mockPopulatedStudent);
    });

    it("should throw CustomError when student is not found", async () => {
        const mockPopulate3 = jest.fn().mockResolvedValue(null);
        const mockPopulate2 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate3 });
        const mockPopulate1 = jest
            .fn()
            .mockReturnValue({ populate: mockPopulate2 });
        const mockFind = { populate: mockPopulate1 };

        Student.findById.mockReturnValue(mockFind);

        try {
            await studentService.getByIdPopulate("bad-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("There is no student with this id!");
        }
    });
});

describe("studentService/remove", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should delete a student when it exists", async () => {
        Student.findByIdAndDelete.mockResolvedValue({ _id: validId });

        await expect(studentService.remove(validId)).resolves.toBeUndefined();
        expect(Student.findByIdAndDelete).toHaveBeenCalledWith(validId);
    });

    it("should throw CustomError when student not found", async () => {
        Student.findByIdAndDelete.mockResolvedValue(null);

        try {
            await studentService.remove("nonexistent-id");
        } catch (err) {
            expect(err).toBeInstanceOf(CustomError);
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe("Student not found");
        }
    });
});

describe("studentService/edit", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("update student with plain data (no classes)", async () => {
        const expected = {
            _id: validId,
            firstName: "Ivan",
            dateUpdate: expect.any(Number),
        };

        Student.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await studentService.edit(validId, {
            firstName: "Ivan",
        });

        expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
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

        Student.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await studentService.edit(validId, {
            clssToAdd: "5A",
        });

        expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
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

        Student.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await studentService.edit(validId, {
            clssToRemove: "5A",
        });

        expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
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

        Student.findByIdAndUpdate.mockResolvedValue(expected);

        const result = await studentService.edit(validId, input);

        expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
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
