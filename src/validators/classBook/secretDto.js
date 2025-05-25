import Joi from "joi";

export const secretsDto = Joi.object({
    teacherKey: Joi.string().trim().min(10).required().messages({
        "string.base": "Teacher key must be a string",
        "string.min": "Teacher key must be at least 10 characters long",
        "any.required": "Teacher key is required",
    }),
    directorKey: Joi.string().trim().min(10).required().messages({
        "string.base": "Director key must be a string",
        "string.min": "Director key must be at least 10 characters long",
        "any.required": "Director key is required",
    }),
});
