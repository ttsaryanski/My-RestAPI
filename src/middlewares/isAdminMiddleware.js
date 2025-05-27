import { CustomError } from "../utils/errorUtils/customError.js";

const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        throw new CustomError("Admin access required", 403);
    }

    next();
};

export { isAdmin };
