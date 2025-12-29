const productsService = require('../services/productsService');

const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.json(products);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productsService.createProduct(
      req.body
    );
    res.status(201).json(product);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    await productsService.updateProduct(
      req.params.id,
      req.body
    );
    res.sendStatus(204);
  } catch (err) {
    console.log(err.message);
    res.status(404).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productsService.deleteProduct(
      req.params.id
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
