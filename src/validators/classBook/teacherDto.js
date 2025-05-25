import Joi from "joi";

import { objectIdValidator } from "../../utils/objectIdValidator.js";

export const editTeacherDto = Joi.object({
    firstName: Joi.string().min(3).optional(),
    lastName: Joi.string().min(3).optional(),
    speciality: Joi.string().min(3).allow(null, "").optional(),

    clssToAdd: objectIdValidator.optional(),
    clssToRemove: objectIdValidator.optional(),
});
