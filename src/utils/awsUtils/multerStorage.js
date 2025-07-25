//import os from "os";
import multer from "multer";
import { CustomError } from "../errorUtils/customError.js";

const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new CustomError(
                "Invalid file type. Only jpg, jpeg, and png files are allowed!",
                400
            ),
            false
        );
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
