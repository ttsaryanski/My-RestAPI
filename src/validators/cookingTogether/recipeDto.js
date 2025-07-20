import Joi from "joi";

export const recipeDto = Joi.object({
    title: Joi.string().min(5).required().messages({
        "string.min": "Title should be at least 5 characters long!",
        "any.required": "Title is required!",
    }),
    description: Joi.string().min(10).required().messages({
        "string.min": "Description should be at least 10 characters long!",
        "any.required": "Description is required!",
    }),
    ingredients: Joi.string().min(10).required().messages({
        "string.min": "Ingredients should be at least 10 characters long!",
        "any.required": "Ingredients is required!",
    }),
    instructions: Joi.string().min(10).required().messages({
        "string.min": "Instructions should be at least 10 characters long!",
        "any.required": "Instructions is required!",
    }),
    imageUrl: Joi.string()
        .uri({ scheme: ["http", "https"] })
        .required()
        .messages({
            "string.uriCustomScheme": "Invalid image URL!",
            "any.required": "Image is required!",
        }),
});
