const express = require('express');
const {
  createPayment,
  verifyPayment,
  getMyOrders
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/create-payment', createPayment);
router.post('/verify', verifyPayment);
router.get('/my', getMyOrders);

module.exports = router;
