const FridgeItem = require("../models/FridgeItem");
const Product = require("../models/Product");

const getUserFridgeItems = async (userId) => {
  return FridgeItem.findAll({
    where: { user_id: userId },
    include: [{ model: Product }],
    order: [["addedDate", "DESC"]],
  });
};

const createFridgeItem = async (userId, data) => {
  return FridgeItem.create({
    id: data.id,
    user_id: userId,
    productId: data.productId,
    quantity: data.quantity ?? 1,
    unit: data.unit ?? "szt",
    addedDate: data.addedDate ?? new Date(),
    lastUpdated: new Date(),
  });
};

const updateFridgeItem = async (userId, id, updates) => {
  const item = await FridgeItem.findOne({
    where: { id, user_id: userId },
  });

  if (!item) {
    throw new Error("Fridge item not found");
  }

  return item.update({
    ...updates,
    lastUpdated: new Date(),
  });
};

const deleteFridgeItem = async (userId, id) => {
  const deleted = await FridgeItem.destroy({
    where: { id, user_id: userId },
  });

  if (!deleted) {
    throw new Error("Fridge item not found");
  }
};

module.exports = {
  getUserFridgeItems,
  createFridgeItem,
  updateFridgeItem,
  deleteFridgeItem,
};
