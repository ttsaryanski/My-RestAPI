import bcrypt from "bcrypt";

import User from "../../models/classBook/User.js";
import Setting from "../../models/classBook/Setting.js";
import Student from "../../models/classBook/Student.js";

import jwt from "../../lib/jwt.js";
import InvalidToken from "../../models/InvalidToken.js";
import { teacherService } from "./teacherService.js";

export const authService = {
    async register(
        firstName,
        lastName,
        email,
        identifier,
        secretKey,
        password,
        profilePicture
    ) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("This email already registered!");
        }

        let role = "";

        const settings = await Setting.findOne();
        if (!settings) {
            throw new Error("Settings not found!");
        }

        if (secretKey === settings.teacherKey) {
            role = "teacher";
        } else if (secretKey === settings.directorKey) {
            role = "director";
        } else {
            role = "student";
        }

        const createdUser = await User.create({
            firstName,
            lastName,
            email,
            role,
            password,
            profilePicture: profilePicture || null,
        });

        if (role === "student") {
            let student = await Student.findOne({ identifier });

            if (student) {
                student._ownerId = createdUser._id;
                student.email = email;
                await student.save();
            } else {
                await Student.create({
                    firstName,
                    lastName,
                    identifier,
                    email,
                    _ownerId: createdUser._id,
                    clss: [],
                });
            }
        } else if (role === "teacher") {
            await teacherService.create(
                {
                    firstName,
                    lastName,
                    email,
                    clss: [],
                },
                createdUser._id
            );
        }

        return createAccessToken(createdUser);
    },

    async login(email, password) {
        const user = await User.findOne({ email });

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
        return await User.findById(id);
    },

    async editUser(userId, data) {
        data.dateUpdate = Date.now();

        return await User.findByIdAndUpdate(userId, data, {
            runValidators: true,
            new: true,
        });
    },
};

async function createAccessToken(user) {
    const payload = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
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
