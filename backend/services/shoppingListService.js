const ShoppingItem = require("../models/ShoppingItem");
const Product = require("../models/Product");

const getUserShoppingItems = async (userId) => {
  return ShoppingItem.findAll({
    where: { user_id: userId },
    include: [{ model: Product }],
    order: [["addedDate", "DESC"]],
  });
};

const createShoppingItem = async (userId, data) => {
  return ShoppingItem.create({
    user_id: userId,
    productId: data.productId ?? null,
    name: data.name ?? null,
    quantity: data.quantity ?? 1,
    checked: data.checked ?? false,
    addedDate: data.addedDate ?? new Date(),
    lastUpdated: new Date(),
  });
};

const updateShoppingItem = async (userId, id, updates) => {
  const item = await ShoppingItem.findOne({
    where: { id, user_id: userId },
  });

  if (!item) {
    throw new Error("Shopping item not found");
  }

  return item.update({
    ...updates,
    lastUpdated: new Date(),
  });
};

const deleteShoppingItem = async (userId, id) => {
  const deleted = await ShoppingItem.destroy({
    where: { id, user_id: userId },
  });

  if (!deleted) {
    throw new Error("Shopping item not found");
  }
};

module.exports = {
  getUserShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
};
