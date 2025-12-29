const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
// const upload = require('../middlewares/uploadMiddleware');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const fridgeItemsController = require('../controllers/fridgeItemsController');
const shoppingListController = require('../controllers/shoppingListController');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);

// przykład endpointu chronionego
// router.get('/profile', authMiddleware, (req, res) => {
//   res.json({ message: "Dane chronione", user: req.user });
// });


router.get('/products', authMiddleware, productsController.getProducts);
router.post('/products', authMiddleware, productsController.createProduct);
router.put('/products/:id', authMiddleware, productsController.updateProduct);
router.delete('/products/:id', authMiddleware, productsController.deleteProduct);

router.get("/fridge-items", authMiddleware, fridgeItemsController.getFridgeItems);
router.post("/fridge-items", authMiddleware, fridgeItemsController.createFridgeItem);
router.put("/fridge-items/:id", authMiddleware, fridgeItemsController.updateFridgeItem);
router.delete("/fridge-items/:id", authMiddleware, fridgeItemsController.deleteFridgeItem);


router.get("/shopping-list", authMiddleware, shoppingListController.getShoppingListItems);
router.post("/shopping-list", authMiddleware, shoppingListController.createShoppingItem);
router.put("/shopping-list/:id", authMiddleware, shoppingListController.updateShoppingItem);
router.delete("/shopping-list/:id", authMiddleware, shoppingListController.deleteShoppingItem);

module.exports = router;