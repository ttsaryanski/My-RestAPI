import { directorService } from "../../../../src/services/classBook/directorService.js";

import Setting from "../../../../src/models/classBook/Setting.js";

jest.mock("../../../../src/models/classBook/Setting.js");

describe("directorService/create()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new secretKeys", async () => {
        const inputData = {
            teacherKey: "test_teacher_key",
            directorKey: "test_director_key",
        };
        const expectedData = { ...inputData };

        const createdSettings = { _id: "test123", ...expectedData };

        Setting.create.mockResolvedValue(createdSettings);

        const result = await directorService.create(inputData);

        expect(Setting.create).toHaveBeenCalledWith(expectedData);
        expect(result).toEqual(createdSettings);
    });
});
