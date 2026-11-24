const express = require('express');
const { addPriceAlert } = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addPriceAlert);

module.exports = router;
