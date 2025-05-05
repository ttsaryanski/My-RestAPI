import { Schema, Types, model } from "mongoose";

const clssSchema = new Schema({
    title: {
        type: String,
        required: [true, "Class title is required!"],
        minLength: [3, "Class title should be at least 3 characters long!"],
        trim: true,
    },
    teacher: {
        type: Types.ObjectId,
        required: [true, "Teacher is required!"],
        ref: "Teacher",
    },
    students: [
        {
            type: Types.ObjectId,
            ref: "Student",
        },
    ],
    _createdBy: {
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

clssSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Clss = model("Clss", clssSchema);

export default Clss;
