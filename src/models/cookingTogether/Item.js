import { Schema, model, Types } from "mongoose";

const itemSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required!"],
        minLength: [5, "Title should be at least 5 characters long!"],
    },
    description: {
        type: String,
        required: [true, "Description is required!"],
        minLength: [10, "Description should be at least 10 characters long!"],
    },
    ingredients: {
        type: String,
        required: [true, "Ingredients is required!"],
        minLength: [10, "Ingredients should be at least 10 characters long!"],
    },
    instructions: {
        type: String,
        required: [true, "Instructions is required!"],
        minLength: [10, "Instructions should be at least 10 characters long!"],
    },
    imageUrl: {
        type: String,
        required: [true, "Image is required!"],
        validate: [/^https?:\/\//, "Invalid image url!"],
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateUpdate: {
        type: Date,
        default: Date.now,
    },
    _ownerId: {
        type: Types.ObjectId,
        ref: "User",
    },
    likes: [
        {
            type: Types.ObjectId,
            ref: "User",
        },
    ],
});

const Item = model("Item", itemSchema);

export default Item;
