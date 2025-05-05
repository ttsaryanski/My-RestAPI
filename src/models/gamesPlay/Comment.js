import { Schema, Types, model } from "mongoose";

const commentSchema = new Schema({
    gameId: {
        type: Types.ObjectId,
        ref: "Game",
    },
    content: {
        type: String,
        required: [true, "Content is required!"],
        minLength: [10, "Content should be at least 10 characters long!"],
        trim: true,
    },
    _ownerId: {
        type: Types.ObjectId,
        ref: "UserGames",
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

commentSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Comment = model("Comment", commentSchema);

export default Comment;
