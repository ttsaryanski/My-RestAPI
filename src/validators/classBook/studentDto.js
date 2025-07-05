import Joi from "joi";

import { objectIdValidator } from "../../utils/objectIdValidator.js"; // това ти е валидатора с mongoose.Types.ObjectId.isValid()

export const createStudentDto = Joi.object({
    firstName: Joi.string().min(3).required().messages({
        "string.base": "First name must be a string!",
        "string.empty": "First name is required!",
        "string.min": "First name should be at least 3 characters long!",
        "any.required": "First name is required!",
    }),
    lastName: Joi.string().min(3).required().messages({
        "string.base": "Last name must be a string!",
        "string.empty": "Last name is required!",
        "string.min": "Last name should be at least 3 characters long!",
        "any.required": "Last name is required!",
    }),
    identifier: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            "string.base": "Identifier must be a string!",
            "string.empty": "Identifier is required!",
            "string.pattern.base": "Identifier must be exactly 10 digits!",
            "any.required": "Identifier is required!",
        }),
});

export const editStudentDto = Joi.object({
    clssToAdd: objectIdValidator.optional().messages({
        "any.invalid": "Class must be a valid ObjectId",
    }),
    clssToRemove: objectIdValidator.optional().messages({
        "any.invalid": "Class must be a valid ObjectId",
    }),
    grades: Joi.array().items(
        Joi.object({
            teacher: objectIdValidator.optional().messages({
                "any.invalid": "Teacher must be a valid ObjectId",
            }),
            class: objectIdValidator.optional().messages({
                "any.invalid": "Class must be a valid ObjectId",
            }),
            value: Joi.number().integer().min(2).max(6).optional().messages({
                "number.base": "Grade value must be a number",
                "number.min": "Grade cannot be less than 2",
                "number.max": "Grade cannot be greater than 6",
            }),
            comment: Joi.string().trim().allow("", null).optional().messages({
                "string.base": "Comment must be a string",
            }),
        })
    ),
}).unknown(true);
