import Setting from "../../models/classBook/Setting.js";

const create = (data) => Setting.create(data);

export default {
    create,
};
