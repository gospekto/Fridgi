const Product = require('../models/Product');

const getProducts = async () => {
  return Product.findAll({
    order: [['name', 'DESC']]
  });
};

const createProduct = async (data) => {
  return Product.create({
    ...data
  });
};

const updateProduct = async (productId, data) => {
  const product = await Product.findOne({
    where: { id: productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product.update(data);
};

const deleteProduct = async (productId) => {
  const product = await Product.findOne({
    where: { id: productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await product.destroy();
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
