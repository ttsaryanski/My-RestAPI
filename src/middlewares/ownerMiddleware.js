import { CustomError } from "../utils/errorUtils/customError.js";

const isOwner = (model, idParam = "id") => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[idParam];
            const userId = req.user._id;

            const resource = await model.findById(resourceId);

            if (!resource) {
                throw new CustomError("Resource not found", 404);
            }

            if (resource._ownerId.toString() !== userId) {
                throw new CustomError(
                    "You are not the owner of this resource",
                    403
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

export { isOwner };
