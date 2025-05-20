import bcrypt from "bcrypt";

import jwt from "../../lib/jwt.js";

import UserAngular from "../../models/cookingTogether/UserAngular.js";
import InvalidToken from "../../models/InvalidToken.js";

export const authService = {
    async register(username, email, password, profilePicture) {
        const user = await UserAngular.findOne({
            $or: [{ username }, { email }],
        });

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
    },

    async login(email, password) {
        const user = await UserAngular.findOne({ email });

        if (!user) {
            throw new Error("User does not exist!");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new Error("Password does not match!");
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
