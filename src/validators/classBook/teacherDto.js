import Joi from "joi";

import { objectIdValidator } from "../../utils/objectIdValidator.js";

export const editTeacherDto = Joi.object({
    firstName: Joi.string().min(3).optional().messages({
        "string.min": "First name should be at least 3 characters long!",
    }),
    lastName: Joi.string().min(3).optional().messages({
        "string.min": "Last name should be at least 3 characters long!",
    }),
    speciality: Joi.string().min(3).allow(null, "").optional().messages({
        "string.min": "Speciality should be at least 3 characters long!",
    }),

    clssToAdd: objectIdValidator.optional().messages({
        "any.invalid": "Class must be a valid ObjectId!",
    }),
    clssToRemove: objectIdValidator.optional().messages({
        "any.invalid": "Class must be a valid ObjectId!",
    }),
})
    .nand("clssToAdd", "clssToRemove")
    .messages({
        "object.nand":
            "You cannot provide both clssToAdd and clssToRemove at the same time!",
    });
