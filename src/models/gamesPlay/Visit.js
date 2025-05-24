import { Schema, Types, model } from "mongoose";

const visitSchema = new Schema({
    page: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Visit = model("Visit", visitSchema);

export default Visit;
