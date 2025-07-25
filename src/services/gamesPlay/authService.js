import bcrypt from "bcrypt";

import jwt from "../../lib/jwt.js";

import { CustomError } from "../../utils/errorUtils/customError.js";

import UserGames from "../../models/gamesPlay/User.js";
import InvalidToken from "../../models/InvalidToken.js";

export const authService = {
    async register(email, password) {
        const existingUser = await UserGames.findOne({ email });

        if (existingUser) {
            throw new CustomError("This email already registered!", 409);
        }

        const createdUser = await UserGames.create({
            email,
            password,
        });

        return createAccessToken(createdUser);
    },

    async login(email, password) {
        const user = await UserGames.findOne({ email });

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
        const user = await UserGames.findById(id, {
            password: 0,
            __v: 0,
        });

        if (!user) {
            throw new CustomError("There is no user with this id!", 404);
        }

        return user;
    },

    async getAllUsers(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const users = await UserGames.aggregate([
            {
                $addFields: {
                    roleOrder: {
                        $cond: [{ $eq: ["$role", "admin"] }, 0, 1],
                    },
                },
            },
            { $sort: { roleOrder: 1, _id: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { roleOrder: 0, password: 0, __v: 0 } },
        ]);

        return { users };
    },

    async remove(userId) {
        const result = await UserGames.findByIdAndDelete(userId);

        if (!result) {
            throw new CustomError("User not found", 404);
        }
    },

    async makeAdmin(userId) {
        const user = await UserGames.findByIdAndUpdate(
            userId,
            { role: "admin" },
            { new: true, projection: { password: 0 } }
        );

        if (!user) {
            throw new CustomError("User not found", 404);
        }

        return user;
    },

    // TODO: This service was used for migration, it is preserved as part of history!
    async updateRole() {
        return await UserGames.updateMany(
            { role: { $exists: false } },
            { $set: { role: "user" } }
        );
    },
};

export async function createAccessToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new CustomError("JWT secret is not configured", 500);
    }

    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return {
        accessToken: token,
    };
}
