import Joi from "joi";

export const userLoginDto = Joi.object({
    email: Joi.string()
        .pattern(
            new RegExp(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/)
        )
        .required()
        .messages({
            "string.patern.base": "Invalid email format!",
            "any.required": "Email is required!",
        }),
    password: Joi.string().min(3).required().messages({
        "string.min": "Password must be at least 3 characters!",
        "any.required": "Password is required!",
    }),
});
