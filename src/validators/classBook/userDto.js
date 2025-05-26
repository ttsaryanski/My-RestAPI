import Joi from "joi";

export const userRegisterDto = Joi.object({
    firstName: Joi.string().min(3).required().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.min": "First name should be at least 3 characters long",
        "any.required": "First name is required",
    }),
    lastName: Joi.string().min(3).required().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.min": "Last name should be at least 3 characters long",
        "any.required": "Last name is required",
    }),
    email: Joi.string()
        .pattern(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.pattern.base": "Invalid email format",
            "any.required": "Email is required",
        }),
    password: Joi.string().min(6).required().messages({
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 6 characters long",
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
    secretKey: Joi.string().optional().messages({
        "string.base": "Secret key must be a string",
        "string.empty": "Secret key is required for teachers",
    }),
    identifier: Joi.string()
        .pattern(/^\d{10}$/)
        .optional()
        .messages({
            "string.pattern.base": "Identifier must be exactly 10 digits",
        }),
    profilePicture: Joi.object({
        fileName: Joi.string().required(),
        fileUrl: Joi.string().uri().required(),
    }).optional(),
})
    .xor("secretKey", "identifier")
    .messages({
        "object.missing":
            "You must provide either a secret key (for teachers) or an identifier (for students)",
        "object.xor": "Only one of secret key or identifier must be provided",
    });

export const userLoginDto = Joi.object({
    email: Joi.string()
        .pattern(/^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.pattern.base": "Invalid email format",
            "any.required": "Email is required",
        }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required",
    }),
});

export const userEditDto = Joi.object({
    firstName: Joi.string().min(3).required().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.min": "First name should be at least 3 characters long",
        "any.required": "First name is required",
    }),
    lastName: Joi.string().min(3).required().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.min": "Last name should be at least 3 characters long",
        "any.required": "Last name is required",
    }),
    profilePicture: Joi.object({
        fileName: Joi.string().required(),
        fileUrl: Joi.string().uri().required(),
    }).optional(),
});
