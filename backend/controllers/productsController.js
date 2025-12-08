const productsService = require('../services/productsService');
const upload = require('../middlewares/uploadMiddleware');

const createProduct = async (req, res, next) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const productData = {
      ...req.body,
      imagePath,
      userId: '1'
    //   userId: req.user.id // jeśli masz autentykację
    };

    const product = await productsService.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct
};