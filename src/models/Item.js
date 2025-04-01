import { Schema, model, Types } from "mongoose";

const itemSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: String,
        trim: true,
    },
    updatedAt: {
        type: String,
        trim: true,
    },
    imageUrl: {
        type: String,
        validate: [/^https?:\/\//, "Invalid image url!"],
    },
    address: {
        country: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        street: {
            type: String,
            trim: true,
        },
        streetNumber: {
            type: String,
            trim: true,
        },
    },
});

const Item = model("Item", itemSchema);

export default Item;
