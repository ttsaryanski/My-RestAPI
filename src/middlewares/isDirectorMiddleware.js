import { CustomError } from "../utils/errorUtils/customError.js";

const isDirector = (req, res, next) => {
    if (req.user?.role !== "director") {
        throw new CustomError("Director access required", 403);
    }

    next();
};

export { isDirector };
