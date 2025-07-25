import Joi from "joi";

export const userRegisterDto = Joi.object({
    username: Joi.string().min(3).required().messages({
        "string.min": "Username must be at least 3 characters!",
        "any.required": "Username is required!",
    }),
    email: Joi.string()
        .pattern(
            new RegExp(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/)
        )
        .required()
        .messages({
            "string.pattern.base": "Invalid email format!",
            "any.required": "Email is required!",
        }),
    password: Joi.string().min(3).required().messages({
        "string.min": "Password must be at least 3 characters!",
        "any.required": "Password is required!",
    }),
    rePassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "rePasswords do not match!",
        "any.required": "Re-enter your rePassword!",
    }),
});

export const userLoginDto = Joi.object({
    email: Joi.string()
        .pattern(
            new RegExp(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/)
        )
        .required()
        .messages({
            "any.required": "Email is required!",
            "string.pattern.base": "Invalid email format!",
        }),
    password: Joi.string().min(3).required().messages({
        "string.min": "Password must be at least 3 characters!",
        "any.required": "Password is required!",
    }),
});
