import { Schema, model } from "mongoose";

const fileShema = new Schema({
  fileName: String,
  fileUrl: String,
  uploadDate: { type: Date, default: Date.now },
});

const File = model("File", fileShema);

export default File;
