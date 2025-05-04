import { Router } from "express";

import itemService from "../services/itemService.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createErrorMsg } from "../utils/errorUtil.js";

const router = Router();

router.get("/", async (req, res) => {
    const query = req.query;

    try {
        const items = await itemService.getAll(query);

        res.status(200).json(items).end();
    } catch (error) {
        res.status(500)
            .json({ message: createErrorMsg(error) })
            .end();
    }
});

router.post("/", authMiddleware, async (req, res) => {
    const userId = await req.cookies?.auth_coocking?.user?._id;
    const data = req.body;

    try {
        const item = await itemService.create(data, userId);

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
        const result = await itemService.getAllPaginated(query);
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
        const items = await itemService.topThree();

        res.status(200).json(items).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.get("/profileItem", async (req, res) => {
    const userId = await req.cookies?.auth_coocking?.user?._id;
    const query = req.query;

    try {
        const result = await itemService.getByOwnerId(userId, query);
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

router.get("/profileLiked", async (req, res) => {
    const userId = await req.cookies?.auth_coocking?.user?._id;
    const query = req.query;

    try {
        const result = await itemService.getByLikedId(userId, query);
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

router.get("/:itemId", async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const item = await itemService.getById(itemId);

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

router.delete("/:itemId", async (req, res) => {
    const itemId = req.params.itemId;

    try {
        await itemService.remove(itemId);

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

router.put("/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    const data = req.body;

    try {
        const item = await itemService.edit(itemId, data);

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
});

router.post("/:itemId/like", authMiddleware, async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.body.params.userId;

    try {
        const item = await itemService.like(itemId, userId);

        res.status(200).json(item).end();
    } catch (error) {
        res.status(500).json({ message: createErrorMsg(error) });
    }
});

export default router;
