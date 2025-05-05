import { Schema, Types, model } from "mongoose";

const studentSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First name is required!"],
        minLength: [3, "First name should be at least 3 characters long!"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required!"],
        minLength: [3, "Last name should be at least 3 characters long!"],
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    identifier: {
        type: String,
        unique: true,
        required: [true, "Identifier is required!"],
        validate: [/^\d{10}$/, "Identifier must be exactly 10 digits."],
    },
    clss: [
        {
            type: Types.ObjectId,
            ref: "Clss",
        },
    ],
    grades: [
        {
            teacher: {
                type: Types.ObjectId,
                ref: "Teacher",
                required: true,
            },
            class: {
                type: Types.ObjectId,
                ref: "Clss",
                required: true,
            },
            value: {
                type: Number,
                required: true,
                min: 2,
                max: 6,
            },
            comment: {
                type: String,
                trim: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    _ownerId: {
        type: Types.ObjectId,
        ref: "User",
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateUpdate: {
        type: Date,
        default: Date.now,
    },
});

studentSchema.pre("save", function (next) {
    this.dateUpdate = Date.now();
    next();
});

const Student = model("Student", studentSchema);

export default Student;
