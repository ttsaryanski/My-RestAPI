import jwt from "../lib/jwt.js";

import { getTokenFromRequest } from "../utils/getUtils/getToken.js";
import { CustomError } from "../utils/errorUtils/customError.js";
import { cookiesNames } from "../config/constans.js";

import InvaliToken from "../models/InvalidToken.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            throw new CustomError("Invalid token!", 401);
        }
        const invalidToken = await InvaliToken.findOne({ token });

        if (invalidToken) {
            throw new CustomError("Invalid token!", 403);
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;
        req.isAuthenticated = true;

        next();
    } catch (error) {
        if (req.cookies[cookiesNames.cookingTogether]) {
            res.clearCookie(cookiesNames.cookingTogether);
        }

        if (req.cookies[cookiesNames.classBook]) {
            res.clearCookie(cookiesNames.classBook);
        }

        if (req.cookies[cookiesNames.gamesPlay]) {
            res.clearCookie(cookiesNames.gamesPlay);
        }

        next(error);
    }
};

export { authMiddleware };
