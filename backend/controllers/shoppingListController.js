const shoppingListService = require("../services/shoppingListService");

const getShoppingListItems = async (req, res) => {
  try {
    const items = await shoppingListService.getUserShoppingItems(
      req.user.id
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch shopping list items",
    });
  }
};

const createShoppingItem = async (req, res) => {
  try {
    const item = await shoppingListService.createShoppingItem(
      req.user.id,
      req.body
    );
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const updateShoppingItem = async (req, res) => {
  try {
    const item = await shoppingListService.updateShoppingItem(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

const deleteShoppingItem = async (req, res) => {
  try {
    await shoppingListService.deleteShoppingItem(
      req.user.id,
      req.params.id
    );
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

module.exports = {
  getShoppingListItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
};
