import bcrypt from "bcrypt";

import UserAngular from "../../models/cookingTogether/UserAngular.js";

import InvalidToken from "../../models/InvalidToken.js";
import jwt from "../../lib/jwt.js";

const register = async (username, email, password, profilePicture) => {
    const user = await UserAngular.findOne({ $or: [{ username }, { email }] });

    if (user) {
        throw new Error("This username or email already registered!");
    }

    const createdUser = await UserAngular.create({
        username,
        email,
        password,
        profilePicture: profilePicture || null,
    });

    return createAccessToken(createdUser);
};

const login = async (email, password) => {
    const user = await UserAngular.findOne({ email });

    if (!user) {
        throw new Error("User does not exist!");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error("Password does not match!");
    }

    return createAccessToken(user);
};

const logout = (token) => InvalidToken.create({ token });

const getUserById = (id) => UserAngular.findById(id);

async function createAccessToken(user) {
    const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return {
        user,
        accessToken: token,
    };
}

export default {
    register,
    login,
    logout,
    getUserById,
};
