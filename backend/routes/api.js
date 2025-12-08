const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
// const upload = require('../middlewares/uploadMiddleware');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// przykład endpointu chronionego
// router.get('/profile', authMiddleware, (req, res) => {
//   res.json({ message: "Dane chronione", user: req.user });
// });

module.exports = router;