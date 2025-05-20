import Setting from "../../models/classBook/Setting.js";

export const directorService = {
    async create(data) {
        return await Setting.create(data);
    },
};
