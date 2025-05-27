import bcrypt from "bcrypt";

import jwt from "../../lib/jwt.js";

import { CustomError } from "../../utils/errorUtils/customError.js";

import UserGames from "../../models/gamesPlay/UserForGamesPlay.js";
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
            { $project: { roleOrder: 0 } },
        ]);

        return { users };
    },

    async logout(token) {
        await InvalidToken.create({ token });
    },

    async getUserById(id) {
        return await UserGames.findById(id);
    },

    async remove(userId) {
        const result = await UserGames.findByIdAndDelete(userId);

        if (!result) {
            throw new CustomError("User not found", 404);
        }
    },

    async makeAdmin(userId) {
        return await UserGames.findByIdAndUpdate(
            userId,
            { role: "admin" },
            { new: true }
        );
    },

    async updateRole() {
        return await UserGames.updateMany(
            { role: { $exists: false } },
            { $set: { role: "user" } }
        );
    },
};

async function createAccessToken(user) {
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
