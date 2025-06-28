import { isAdmin } from "../../../src/middlewares/isAdminMiddleware.js";
import { CustomError } from "../../../src/utils/errorUtils/customError.js";

describe("isAdmin middleware", () => {
    test("should call next if user is admin", () => {
        const req = { user: { role: "admin" } };
        const next = jest.fn();

        isAdmin(req, {}, next);

        expect(next).toHaveBeenCalled();
    });

    test("should throw CustomError if user is not admin", () => {
        const req = { user: { role: "user" } };
        const next = jest.fn();

        expect(() => isAdmin(req, {}, next)).toThrow(CustomError);
    });

    test("should throw CustomError if no user", () => {
        const req = {};
        const next = jest.fn();

        expect(() => isAdmin(req, {}, next)).toThrow("Admin access required");
    });
});
