import Joi from "joi";

export const commentDto = Joi.object({
    content: Joi.string().min(10).required().messages({
        "string.base": "Comment must be a string!",
        "string.empty": "Comment is required!",
        "string.min": "Comment must be at least 10 characters!",
        "any.required": "Comment is required!",
    }),
    gameId: Joi.string()
        .pattern(/^[a-f\d]{24}$/i)
        .required()
        .messages({
            "string.pattern.base": "Invalid game ID format!",
            "any.required": "GameId is required!",
        }),
});
