import Setting from "../models/Setting.js";

const create = (data) => Setting.create(data);

export default {
    create,
};
