import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

import { SALT_ROUNDS } from "../../config/constans.js";

const userSchema = new Schema({
    firstName: {
        type: String,
        // unique: true,
        required: [true, "First name is required!"],
        minLength: [3, "First name should be at least 3 characters long!"],
    },
    lastName: {
        type: String,
        // unique: true,
        required: [true, "Last name is required!"],
        minLength: [3, "Last name should be at least 3 characters long!"],
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
        minLength: [6, "Password should be at least 3 characters long!"],
    },
    role: {
        type: String,
    },
    speciality: {
        type: String,
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
    if (this.isModified("password")) {
        const hash = await bcrypt.hash(this.password, SALT_ROUNDS);

        this.password = hash;
    }
});

const User = model("User", userSchema);

export default User;
