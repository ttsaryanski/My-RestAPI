import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Item from "../../models/cookingTogether/Item.js";

import { recipeDto } from "../../validators/cookingTogether/recipeDto.js";

import { getUserIdFromCookie } from "../../utils/getUtils/getUserIdFromCookie.js";
import { asyncErrorHandler } from "../../utils/errorUtils/asyncErrorHandler.js";
import { CustomError } from "../../utils/errorUtils/customError.js";
import { cookiesNames } from "../../config/constans.js";

export function recipeController(recipeService) {
    const router = Router();

    router.get(
        "/",
        asyncErrorHandler(async (req, res) => {
            const query = req.query;

            const items = await recipeService.getAll(query);

            res.status(200).json(items);
        })
    );

    router.post(
        "/",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const { error } = recipeDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const userId = req.user._id;
            const data = req.body;

            const item = await recipeService.create(data, userId);

            res.status(201).json(item);
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
            const items = await recipeService.topThree();

            res.status(200).json(items);
        })
    );

    router.get(
        "/profileItem",
        asyncErrorHandler(async (req, res) => {
            const userId = await getUserIdFromCookie(
                req,
                cookiesNames.cookingTogether
            );
            const query = req.query;

            if (userId) {
                const result = await recipeService.getByOwnerId(userId, query);
                const payload = {
                    items: result.items,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                };

                res.status(200).json(payload);
            } else {
                throw new CustomError("User not authenticated", 401);
            }
        })
    );

    router.get(
        "/profileLiked",
        asyncErrorHandler(async (req, res) => {
            const userId = await getUserIdFromCookie(
                req,
                cookiesNames.cookingTogether
            );
            const query = req.query;

            if (userId) {
                const result = await recipeService.getByLikedId(userId, query);
                const payload = {
                    items: result.items,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                };

                res.status(200).json(payload);
            } else {
                throw new CustomError("User not authenticated", 401);
            }
        })
    );

    router.get(
        "/:itemId",
        asyncErrorHandler(async (req, res) => {
            const itemId = req.params.itemId;

            const item = await recipeService.getById(itemId);

            res.status(200).json(item);
        })
    );

    router.delete(
        "/:itemId",
        authMiddleware,
        isOwner(Item, "itemId"),
        asyncErrorHandler(async (req, res) => {
            const itemId = req.params.itemId;

            await recipeService.remove(itemId);

            res.status(204).end();
        })
    );

    router.put(
        "/:itemId",
        authMiddleware,
        isOwner(Item, "itemId"),
        asyncErrorHandler(async (req, res) => {
            const { error } = recipeDto.validate(req.body);
            if (error) {
                throw new CustomError(error.details[0].message, 400);
            }

            const itemId = req.params.itemId;
            const data = req.body;

            const item = await recipeService.edit(itemId, data);

            res.status(201).json(item);
        })
    );

    router.post(
        "/:itemId/like",
        authMiddleware,
        asyncErrorHandler(async (req, res) => {
            const itemId = req.params.itemId;
            const userId = req.user._id;

            const item = await recipeService.like(itemId, userId);

            res.status(200).json(item);
        })
    );

    return router;
}
