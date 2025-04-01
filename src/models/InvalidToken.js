import { Schema, model } from "mongoose";

const InvalidTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "2d",
  },
});

const InvaliToken = model("InvaliToken", InvalidTokenSchema);

export default InvaliToken;
