const express = require('express');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProductPrice,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.patch('/:id/price', authMiddleware, adminMiddleware, updateProductPrice);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
