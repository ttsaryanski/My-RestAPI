import Joi from "joi";

import { objectIdValidator } from "../../utils/objectIdValidator.js";

export const classDto = Joi.object({
    title: Joi.string().trim().min(3).required().messages({
        "string.base": "Title must be a string",
        "string.empty": "Title is required",
        "string.min": "Title should be at least 3 characters long",
        "any.required": "Title is required",
    }),
    teacher: objectIdValidator.required().messages({
        "any.required": "Teacher is required",
        "any.invalid": "Teacher must be a valid ObjectId",
    }),
    students: Joi.array().items(objectIdValidator).messages({
        "any.invalid": "Each student must be a valid ObjectId",
    }),
});
