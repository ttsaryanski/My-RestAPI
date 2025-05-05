import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";

import { SALT_ROUNDS } from "../../config/constans.js";

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Email is required!"],
        minLength: [3, "Username should be at least 3 characters long!"],
    },
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
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateUpdate: {
        type: Date,
        default: Date.now,
    },
    profilePicture: {
        fileName: String,
        fileUrl: String,
    },
});

userSchema.pre("save", async function () {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);

    this.password = hash;
});

const UserAngular = model("UserAngular", userSchema);

export default UserAngular;
