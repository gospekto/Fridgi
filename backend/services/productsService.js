const Product = require('../models/Product');
const pool = require('../config/db');

const productModel = new Product(pool);

const createProduct = async (productData) => {
  return await productModel.create(productData);
};

const getProductsByUser = async (userId) => {
  return await productModel.findByUserId(userId);
};

module.exports = {
  createProduct,
  getProductsByUser
};