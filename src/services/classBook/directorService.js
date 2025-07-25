import Setting from "../../models/classBook/Setting.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export const directorService = {
    async create(data) {
        const count = await Setting.countDocuments();
        if (count >= 1) {
            throw new CustomError("Secret keys already exist!", 403);
        } else {
            return await Setting.create(data);
        }
    },
};
