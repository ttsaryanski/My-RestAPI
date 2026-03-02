import { CustomError } from "../utils/errorUtils/customError.js";

const isNotForStudent = (req, res, next) => {
    if (req.user?.role !== "director" && req.user?.role !== "teacher") {
        throw new CustomError(
            "You do not have the necessary access rights.",
            403
        );
    }

    next();
};

export { isNotForStudent };
