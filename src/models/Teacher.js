import { Schema, Types, model } from "mongoose";

const teacherSchema = new Schema({
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
    },
    speciality: {
        type: String,
        minLength: [3, "Speciality should be at least 3 characters long!"],
    },
    clss: [
        {
            type: Types.ObjectId,
            ref: "Clss",
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

teacherSchema.pre("save", function (next) {
    this.dateUpdate = Date.now();
    next();
});

const Teacher = model("Teacher", teacherSchema);

export default Teacher;
