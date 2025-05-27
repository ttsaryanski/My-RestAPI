export const createErrorMsg = (err) => {
    if (!err) return "Unknown error";

    if (err?.name === "ValidationError") {
        return Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (err?.name === "CastError") {
        return "Missing or invalid data!";
    }

    if (err?.name === "MongooseError") {
        return "Server is busy, please try again later!";
    }

    if (err?.name === "MongoServerError" && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return `Duplicate ${field}: "${err.keyValue[field]}" already exists.`;
    }

    if (err?.name === "CustomError" && err.message) {
        return err.message;
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return "Invalid JSON input!";
    }

    return err.message || "Something went wrong";
};
