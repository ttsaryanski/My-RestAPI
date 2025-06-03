import { authMiddleware } from "../../src/middlewares/authMiddleware.js";

import jwt from "../../src/lib/jwt.js";
import { getTokenFromRequest } from "../../src/utils/getUtils/getToken.js";
import InvalidToken from "../../src/models/InvalidToken.js";

import { cookiesNames } from "../../src/config/constans.js";

jest.mock("../../src/lib/jwt.js");
jest.mock("../../src/utils/getUtils/getToken.js");
jest.mock("../../src/models/InvalidToken.js");

describe("authMiddleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {},
        };
        res = {
            clearCookie: jest.fn(),
        };
        next = jest.fn();
    });

    it("should throw 401 if no token is present", async () => {
        getTokenFromRequest.mockReturnValue(null);

        await authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                message: "Invalid token!",
            })
        );
    });

    it("should throw 403 if token is in InvalidToken list", async () => {
        getTokenFromRequest.mockReturnValue("testToken");
        InvalidToken.findOne.mockResolvedValue({ token: "testToken" });

        await authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 403,
                message: "Invalid token!",
            })
        );
    });

    it("should decode token and attach user to request", async () => {
        getTokenFromRequest.mockReturnValue("validToken");
        InvalidToken.findOne.mockResolvedValue(null);
        jwt.verify.mockResolvedValue({ id: "user1", email: "a@a.bg" });

        await authMiddleware(req, res, next);

        expect(req.user).toEqual({ id: "user1", email: "a@a.bg" });
        expect(req.isAuthenticated).toBe(true);
        expect(next).toHaveBeenCalledWith();
    });

    it("should clear cookies and forward error on jwt error", async () => {
        getTokenFromRequest.mockReturnValue("badToken");
        InvalidToken.findOne.mockResolvedValue(null);
        jwt.verify.mockRejectedValue(new Error("Token error"));

        req.cookies = {
            [cookiesNames.cookingTogether]: "c",
            [cookiesNames.classBook]: "cl",
            [cookiesNames.gamesPlay]: "g",
        };

        await authMiddleware(req, res, next);

        expect(res.clearCookie).toHaveBeenCalledWith(
            cookiesNames.cookingTogether
        );
        expect(res.clearCookie).toHaveBeenCalledWith(cookiesNames.classBook);
        expect(res.clearCookie).toHaveBeenCalledWith(cookiesNames.gamesPlay);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
