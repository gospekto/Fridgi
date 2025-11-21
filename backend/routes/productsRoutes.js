const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const upload = require('../middlewares/uploadMiddleware');
// const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/',
//   authMiddleware,
  upload.single('image'),
  productsController.createProduct
);

// Pozostałe endpointy...

module.exports = router;