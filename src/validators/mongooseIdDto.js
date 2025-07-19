import Joi from "joi";

import { objectIdValidator } from "../utils/objectIdValidator.js";

export const mongooseIdDto = Joi.object({
    id: objectIdValidator.required(),
}).messages({
    "any.invalid": "Id must be a valid MongooseDB ObjectId!",
    "any.required": "Id is required",
});
