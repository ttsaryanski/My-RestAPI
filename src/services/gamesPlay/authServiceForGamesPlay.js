import bcrypt from "bcrypt";

import jwt from "../../lib/jwt.js";
import UserGames from "../../models/gamesPlay/UserForGamesPlay.js";
import InvalidToken from "../../models/InvalidToken.js";

const register = async (email, password) => {
    const existingUser = await UserGames.findOne({ email });

    if (existingUser) {
        throw new Error("This email already registered!");
    }

    const createdUser = await UserGames.create({
        email,
        password,
    });

    return createAccessToken(createdUser);
};

const login = async (email, password) => {
    const user = await UserGames.findOne({ email });

    if (!user) {
        throw new Error("User does not exist!");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error("Password does not match!");
    }

    return createAccessToken(user);
};

const getAllUsers = async (query = {}) => {
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
};

const logout = (token) => InvalidToken.create({ token });

const getUserById = (id) => UserGames.findById(id);

const remove = (userId) => UserGames.findByIdAndDelete(userId);

const makeAdmin = (userId) =>
    UserGames.findByIdAndUpdate(userId, { role: "admin" }, { new: true });

async function createAccessToken(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return {
        user,
        accessToken: token,
    };
}

const updateRole = () =>
    UserGames.updateMany(
        { role: { $exists: false } },
        { $set: { role: "user" } }
    );

export default {
    register,
    login,
    logout,
    getUserById,
    updateRole,
    getAllUsers,
    remove,
    makeAdmin,
};
