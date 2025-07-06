//import os from "os";
import multer from "multer";

const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only jpg, jpeg, and png files are allowed."
            ),
            false
        );
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
