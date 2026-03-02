import { CustomError } from "../utils/errorUtils/customError.js";

const isTeacher = (req, res, next) => {
    if (req.user?.role !== "teacher") {
        throw new CustomError("Teacher access required", 403);
    }

    next();
};

export { isTeacher };
