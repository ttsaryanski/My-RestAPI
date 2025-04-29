import { Schema, Types, model } from "mongoose";

const gameSchema = new Schema({
    title: {
        type: String,
        required: [true, "Game title is required!"],
        minLength: [3, "Game title should be at least 3 characters long!"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Category is required!"],
        minLength: [3, "Category should be at least 3 characters long!"],
    },
    maxLevel: {
        type: Number,
        required: [true, "MaxLevel is required!"],
        min: [0, "MaxLevel must be a positive number!"],
        max: [100, "MaxLevel cannot be more than 100!"],
    },
    imageUrl: {
        type: String,
        required: [true, "Game image is required!"],
        validate: [/^https?:\/\//, "Invalid image url!"],
    },
    summary: {
        type: String,
        required: [true, "Summary is required!"],
        minLength: [10, "Summary should be at least 10 characters long!"],
    },
    _ownerId: {
        type: Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

gameSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Game = model("Game", gameSchema);

export default Game;
