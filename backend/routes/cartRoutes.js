const express = require('express');
const {
  addToCart,
  removeFromCart
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addToCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
