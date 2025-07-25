import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";

import {
    createStudentDto,
    editStudentDto,
} from "../../validators/classBook/studentDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";
import { paginationDto } from "../../validators/paginationDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function studentController(studentService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const students = await studentService.getAll(query);

            res.status(200).json(students);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const data = req.body;

            const { error: dataError } = createStudentDto.validate(req.body);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const item = await studentService.create(data, userId);

            res.status(201).json(item);
        })
    );

    router.post(
        "/paginated",
        asyncErrorHandler(async (req, res) => {
            const query = req.body;

            const { error: dataError } = paginationDto.validate(query);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const result = await studentService.getAllPaginated(query);
            const payload = {
                students: result.students,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload);
        })
    );

    router.get(
        "/:studentId",
        asyncErrorHandler(async (req, res) => {
            const studentId = req.params.studentId;

            const { error: idError } = mongooseIdDto.validate({
                id: studentId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const student = await studentService.getById(studentId);

            res.status(200).json(student);
        })
    );

    router.get(
        "/:studentId/populate",
        asyncErrorHandler(async (req, res) => {
            const studentId = req.params.studentId;

            const { error: idError } = mongooseIdDto.validate({
                id: studentId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const student = await studentService.getByIdPopulate(studentId);

            res.status(200).json(student);
        })
    );

    router.put(
        "/:studentId",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const studentId = req.params.studentId;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({
                id: studentId,
            });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = editStudentDto.validate(req.body);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const student = await studentService.edit(studentId, data);

            res.status(201).json(student);
        })
    );

    return router;
}
