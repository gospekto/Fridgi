const fridgeService = require("../services/fridgeItemsService");

const getFridgeItems = async (req, res) => {
  try {
    const items = await fridgeService.getUserFridgeItems(req.user.id);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch fridge items" });
  }
};

const createFridgeItem = async (req, res) => {
  try {
    const item = await fridgeService.createFridgeItem(
      req.user.id,
      req.body
    );
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const updateFridgeItem = async (req, res) => {
  try {
    const item = await fridgeService.updateFridgeItem(
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

const deleteFridgeItem = async (req, res) => {
  try {
    await fridgeService.deleteFridgeItem(
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
  getFridgeItems,
  createFridgeItem,
  updateFridgeItem,
  deleteFridgeItem
};
