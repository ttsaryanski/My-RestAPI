import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Item from "../../models/cookingTogether/Item.js";

import { recipeDto } from "../../validators/cookingTogether/recipeDto.js";
import { mongooseIdDto } from "../../validators/mongooseIdDto.js";

import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";

export function recipeController(recipeService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const recipes = await recipeService.getAll(query);

            res.status(200).json(recipes);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = recipeDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const recipe = await recipeService.create(data, userId);

            res.status(201).json(recipe);
        })
    );

    router.get(
        "/paginated",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const result = await recipeService.getAllPaginated(query);

            const payload = {
                items: result.items,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload);
        })
    );

    router.get(
        "/top-three",
        asyncErrorHandler(async (req, res) => {
            const recipes = await recipeService.topThree();

            res.status(200).json(recipes);
        })
    );

    router.get(
        "/profileItem",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const query = req.query;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const result = await recipeService.getByOwnerId(userId, query);
            const payload = {
                items: result.items,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload);
        })
    );

    router.get(
        "/profileLiked",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const userId = req.user._id;
            const query = req.query;

            const { error: idError } = mongooseIdDto.validate({ id: userId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const result = await recipeService.getByLikedId(userId, query);
            const payload = {
                items: result.items,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload);
        })
    );

    router.get(
        "/:recipeId",
        asyncErrorHandler(async (req, res) => {
            const recipeId = req.params.recipeId;

            const { error: idError } = mongooseIdDto.validate({ id: recipeId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const recipe = await recipeService.getById(recipeId);

            res.status(200).json(recipe);
        })
    );

    router.delete(
        "/:recipeId",
        authMiddleware,
        isOwner(Item, "recipeId"),
        asyncErrorHandler(async (req, res) => {
            const recipeId = req.params.recipeId;

            const { error: idError } = mongooseIdDto.validate({ id: recipeId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            await recipeService.remove(recipeId);

            res.status(204).end();
        })
    );

    router.put(
        "/:recipeId",
        authMiddleware,
        isOwner(Item, "recipeId"),
        asyncErrorHandler(async (req, res) => {
            const recipeId = req.params.recipeId;
            const data = req.body;

            const { error: idError } = mongooseIdDto.validate({ id: recipeId });
            if (idError) {
                throw new CustomError(idError.details[0].message, 400);
            }

            const { error: dataError } = recipeDto.validate(data);
            if (dataError) {
                throw new CustomError(dataError.details[0].message, 400);
            }

            const recipe = await recipeService.edit(recipeId, data);

            res.status(201).json(recipe);
        })
    );

    router.post(
        "/:recipeId/like",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const recipeId = req.params.recipeId;
            const userId = req.user._id;

            const { error: idError1 } = mongooseIdDto.validate({
                id: recipeId,
            });
            if (idError1) {
                throw new CustomError(idError1.details[0].message, 400);
            }

            const { error: idError2 } = mongooseIdDto.validate({
                id: userId,
            });
            if (idError2) {
                throw new CustomError(idError2.details[0].message, 400);
            }

            const recipe = await recipeService.like(recipeId, userId);

            res.status(200).json(recipe);
        })
    );

    return router;
}
