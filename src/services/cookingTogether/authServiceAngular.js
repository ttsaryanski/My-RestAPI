import bcrypt from "bcrypt";

import jwt from "../../lib/jwt.js";

import { CustomError } from "../../utils/errorUtils/customError.js";

import UserAngular from "../../models/cookingTogether/UserAngular.js";
import InvalidToken from "../../models/InvalidToken.js";

export const authService = {
    async register(username, email, password, profilePicture) {
        const user = await UserAngular.findOne({
            $or: [{ username }, { email }],
        });

        if (user) {
            throw new CustomError(
                "This username or email already registered!",
                409
            );
        }

        const createdUser = await UserAngular.create({
            username,
            email,
            password,
            profilePicture: profilePicture || null,
        });

        return createAccessToken(createdUser);
    },

    async login(email, password) {
        const user = await UserAngular.findOne({ email });

        if (!user) {
            throw new CustomError("User does not exist!", 404);
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new CustomError("Password does not match!", 401);
        }

        return createAccessToken(user);
    },

    async logout(token) {
        await InvalidToken.create({ token });
    },

    async getUserById(id) {
        return await UserAngular.findById(id);
    },
};

async function createAccessToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new CustomError("JWT secret is not configured", 500);
    }

    const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return {
        accessToken: token,
    };
}
