import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

import { SALT_ROUNDS } from "../../config/constans.js";

const userGamesSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required!"],
        validate: [
            /^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            "Invalid email!",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minLength: [3, "Password should be at least 3 characters long!"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

userGamesSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hash = await bcrypt.hash(this.password, SALT_ROUNDS);

        this.password = hash;
    }
});

const UserGames = model("UserGames", userGamesSchema);

export default UserGames;
