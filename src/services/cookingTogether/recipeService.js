import { CustomError } from "../../utils/customError.js";

import Item from "../../models/cookingTogether/Item.js";

export const recipeService = {
    async getAll(query = {}) {
        let filter = {};

        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }

        let recipeQuery = Item.find(filter).sort({ dateUpdate: -1 });

        if (query.limit) {
            const limit = Number(query.limit);
            recipeQuery = recipeQuery.limit(limit);
        }

        const recipes = await recipeQuery;
        return recipes;
    },

    async getAllPaginated(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 9;
        const skip = (page - 1) * limit;

        const [items, totalCount] = await Promise.all([
            Item.find().skip(skip).limit(limit),
            Item.countDocuments(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = page;

        return { items, totalCount, totalPages, currentPage };
    },

    async create(data, userId) {
        const newRecipe = await Item.create({ ...data, _ownerId: userId });

        if (!newRecipe) {
            throw new CustomError("Missing or invalid data!", 400);
        }

        return newRecipe;
    },

    async getById(itemId) {
        const recipe = await Item.findById(itemId);

        if (!recipe) {
            throw new CustomError("There is no recipe with this id!", 404);
        }

        return recipe;
    },

    async remove(itemId) {
        const result = await Item.findByIdAndDelete(itemId);
        if (!result) throw new Error("Recipe not found");
    },

    async edit(itemId, data) {
        data.dateUpdate = Date.now();

        const editedRecipe = await Item.findByIdAndUpdate(itemId, data, {
            runValidators: true,
            new: true,
        });

        if (!editedRecipe) {
            throw new CustomError("Missing or invalid data!", 400);
        }

        return editedRecipe;
    },

    async like(itemId, userId) {
        return await Item.findByIdAndUpdate(itemId, {
            $addToSet: { likes: userId, new: true },
        });
    },

    async topThree() {
        const topRecipes = await Item.aggregate([
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                },
            },
            {
                $sort: {
                    likesCount: -1,
                    dateUpdate: -1,
                },
            },
            {
                $limit: 3,
            },
        ]);

        return topRecipes;
    },

    async getByOwnerId(ownerId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 5;
        const skip = (page - 1) * limit;

        const [items, totalCount] = await Promise.all([
            Item.find({ _ownerId: ownerId }).skip(skip).limit(limit),
            Item.countDocuments({ _ownerId: ownerId }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = page;

        return { items, totalCount, totalPages, currentPage };
    },

    async getByLikedId(userId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 5;
        const skip = (page - 1) * limit;

        const [items, totalCount] = await Promise.all([
            Item.find({ likes: userId }).skip(skip).limit(limit),
            Item.countDocuments({ likes: userId }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = page;

        return { items, totalCount, totalPages, currentPage };
    },
};
