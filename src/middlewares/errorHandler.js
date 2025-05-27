import { createErrorMsg } from "../utils/errorUtils/errorUtil.js";

export function errorHandler(err, req, res, next) {
    console.error("ErrorHandler middleware error", err);

    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const message = createErrorMsg(err);

    res.status(status).json({ message });
}
