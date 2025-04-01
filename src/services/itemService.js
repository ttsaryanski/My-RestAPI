import Item from "../models/Item.js";

const getAll = (query = {}) => {
  let items = Item.find();

  if (query.search) {
    items.find({ title: { $regex: query.search, $options: "i" } });
  }
  if (query.limit) {
    items.find().limit(query.limit).sort({ dateUpdate: -1 });
  }

  return items;
};

const getAllPaginated = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 9;
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    Item.find().skip(skip).limit(limit).sort({ dateUpdated: -1 }),
    Item.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;

  return { items, totalCount, totalPages, currentPage };
};

const create = (data, userId) => Item.create({ ...data, _ownerId: userId });

const getById = (itemId) => Item.findById(itemId);

const remove = (itemId) => Item.findByIdAndDelete(itemId);

const edit = (itemId, data) => {
  data.dateUpdate = Date.now();

  return Item.findByIdAndUpdate(itemId, data, {
    runValidators: true,
    new: true,
  });
};

const like = (itemId, userId) =>
  Item.findByIdAndUpdate(itemId, {
    $addToSet: { likes: userId, new: true },
  });

const topThree = () => {
  const topRecipes = Item.aggregate([
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
};

const getByOwnerId = async (ownerId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 5;
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    Item.find({ _ownerId: ownerId })
      .skip(skip)
      .limit(limit)
      .sort({ dateUpdated: -1 }),
    Item.countDocuments({ _ownerId: ownerId }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;

  return { items, totalCount, totalPages, currentPage };
};

const getByLikedId = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 5;
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    Item.find({ likes: userId })
      .skip(skip)
      .limit(limit)
      .sort({ dateUpdated: -1 }),
    Item.countDocuments({ likes: userId }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;

  return { items, totalCount, totalPages, currentPage };
};

export default {
  getAll,
  getAllPaginated,
  create,
  getById,
  remove,
  edit,
  like,
  topThree,
  getByOwnerId,
  getByLikedId,
};
