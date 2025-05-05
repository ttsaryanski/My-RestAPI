import { Schema, model, Types } from "mongoose";

const settingSchema = new Schema({
    teacherKey: {
        type: String,
        trim: true,
    },
    directorKey: {
        type: String,
        trim: true,
    },
    updatedBy: {
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

const Setting = model("Setting", settingSchema);

export default Setting;
