import errorHandler from "../../../src/middlewares/errorHandler.js";

import { createErrorMsg } from "../../../src/utils/errorUtils/errorUtil.js";

jest.mock("../../../src/utils/errorUtils/errorUtil.js", () => ({
    createErrorMsg: jest.fn(() => "Generated error message"),
}));

describe("errorHandler middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            headersSent: false,
        };
        next = jest.fn();
    });

    test("should respond with 500 and default message if no status in error", () => {
        const error = new Error("Something went wrong");

        errorHandler(error, req, res, next);

        expect(createErrorMsg).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Generated error message",
        });
    });

    test("should respond with custom statusCode if provided", () => {
        const error = { message: "Unauthorized", statusCode: 401 };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Generated error message",
        });
    });

    test("should respond with custom status if provided", () => {
        const error = { message: "Forbidden", status: 403 };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Generated error message",
        });
    });

    test("should call next(err) if headers already sent", () => {
        res.headersSent = true;
        const error = new Error("Already sent");

        errorHandler(error, req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
