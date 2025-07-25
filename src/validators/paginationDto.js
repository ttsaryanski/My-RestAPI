import Joi from "joi";

export const paginationDto = Joi.object({
    page: Joi.number().min(0).optional().messages({
        "number.base": "Page must be a number!",
        "number.min": "Page must be a positive number!",
    }),
    limit: Joi.number().min(1).max(100).optional().messages({
        "number.base": "Limit must be a number!",
        "number.min": "Limit cannot be less than 1!",
        "number.max": "Limit must be between 1 and 100!",
    }),
});

export const paginationPageDto = Joi.object({
    page: Joi.number().min(1).optional().messages({
        "number.base": "Page must be a number!",
        "number.min": "Page cannot be less than 1!",
    }),
});

export const paginationLimitDto = Joi.object({
    limit: Joi.number().min(1).max(100).messages({
        "number.base": "Limit must be a number!",
        "number.min": "Limit cannot be less than 1!",
        "number.max": "Limit must be between 1 and 100!",
    }),
});
