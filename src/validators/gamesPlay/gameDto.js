import Joi from "joi";

export const gameDto = Joi.object({
    title: Joi.string().min(3).trim().required().messages({
        "string.base": "Title must be a string!",
        "string.empty": "Game title is required!",
        "string.min": "Game title should be at least 3 characters long!",
        "any.required": "Game title is required!",
    }),
    category: Joi.string().min(3).required().messages({
        "string.base": "Category must be a string!",
        "string.empty": "Category is required!",
        "string.min": "Category should be at least 3 characters long!",
        "any.required": "Category is required!",
    }),
    maxLevel: Joi.number().min(0).max(100).required().messages({
        "number.base": "MaxLevel must be a number!",
        "number.min": "MaxLevel must be a positive number!",
        "number.max": "MaxLevel cannot be more than 100!",
        "any.required": "MaxLevel is required!",
    }),
    imageUrl: Joi.string()
        .uri({ scheme: ["http", "https"] })
        .required()
        .messages({
            "string.base": "Image URL must be a string!",
            "string.empty": "Game image is required!",
            "string.uriCustomScheme": "Invalid image url!",
            "any.required": "Game image is required!",
        }),
    summary: Joi.string().min(10).required().messages({
        "string.base": "Summary must be a string",
        "string.empty": "Summary is required!",
        "string.min": "Summary should be at least 10 characters long!",
        "any.required": "Summary is required!",
    }),
});
