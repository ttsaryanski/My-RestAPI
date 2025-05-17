import { Router } from "express";

import recipeService from "../../services/cookingTogether/recipeService.js";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { isOwner } from "../../middlewares/ownerMiddleware.js";
import Item from "../../models/cookingTogether/Item.js";

import { createErrorMsg } from "../../utils/errorUtil.js";
import { getUserIdFromCookie } from "../../utils/getUserIdFromCookie.js";

const router = Router();

router.get("/", async (req, res) => {
    const query = req.query;

    try {
        const items = await recipeService.getAll(query);

        res.status(200).json(items).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.post("/", authMiddleware, async (req, res) => {
    const userId = req.user._id;
    const data = req.body;

    try {
        const item = await recipeService.create(data, userId);

        res.status(201).json(item).end();
    } catch (error) {
        if (error.message.includes("validation")) {
            res.status(400)
                .json({ message: createErrorMsg(error) })
                .end();
        } else if (error.message === "Missing or invalid data!") {
            res.status(400)
                .json({ message: createErrorMsg(error) })
                .end();
        } else {
            res.status(500)
                .json({ message: createErrorMsg(error) })
                .end();
        }
    }
});

router.get("/paginated", async (req, res) => {
    const query = req.query;

    try {
        const result = await recipeService.getAllPaginated(query);
        const payload = {
            items: result.items,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        };

        res.status(200).json(payload).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/top-three", async (req, res) => {
    try {
        const items = await recipeService.topThree();

        res.status(200).json(items).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/profileItem", async (req, res) => {
    const userId = await getUserIdFromCookie(req);
    const query = req.query;

    if (userId) {
        try {
            const result = await recipeService.getByOwnerId(userId, query);
            const payload = {
                items: result.items,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    } else {
        res.status(401).json({ message: "User not authenticated" });
    }
});

router.get("/profileLiked", async (req, res) => {
    const userId = await getUserIdFromCookie(req);
    const query = req.query;

    if (userId) {
        try {
            const result = await recipeService.getByLikedId(userId, query);
            const payload = {
                items: result.items,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            };

            res.status(200).json(payload).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    } else {
        res.status(401).json({ message: "User not authenticated" });
    }
});

router.get("/:itemId", async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const item = await recipeService.getById(itemId);

        if (item !== null) {
            res.status(200).json(item).end();
        } else {
            res.status(404)
                .json({ message: "There is no item with this id." })
                .end();
        }
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.delete(
    "/:itemId",
    authMiddleware,
    isOwner(Item, "itemId"),
    async (req, res) => {
        const itemId = req.params.itemId;

        try {
            await recipeService.remove(itemId);

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ message: createErrorMsg(error) });
        }
    }
);

router.put(
    "/:itemId",
    authMiddleware,
    isOwner(Item, "itemId"),
    async (req, res) => {
        const itemId = req.params.itemId;
        const data = req.body;

        try {
            const item = await recipeService.edit(itemId, data);

            res.status(201).json(item).end();
        } catch (error) {
            if (error.message.includes("validation")) {
                res.status(400).json({ message: createErrorMsg(error) });
            } else if (error.message === "Missing or invalid data!") {
                res.status(400).json({ message: createErrorMsg(error) });
            } else {
                res.status(500).json({ message: createErrorMsg(error) });
            }
        }
    }
);

router.post("/:itemId/like", authMiddleware, async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.user._id;

    try {
        const item = await recipeService.like(itemId, userId);

        res.status(200).json(item).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

export default router;
