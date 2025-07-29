import Joi from "joi";

export const searchDto = Joi.object({
    search: Joi.string().trim().min(1).optional().messages({
        "string.base": "Search value must be a string!",
        "string.min": "Search value be at least 1 characters long!",
        "string.empty": "Search value cannot be an empty value!",
    }),
    limit: Joi.number().min(1).max(100).optional().messages({
        "number.base": "Limit must be a number!",
        "number.min": "Limit cannot be less than 1!",
        "number.max": "Limit must be between 1 and 100!",
    }),
});

export const searchEmailDto = Joi.object({
    email: Joi.string()
        .pattern(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid email format!",
        }),
});
