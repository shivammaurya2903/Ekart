const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

const addPriceAlert = async (req, res, next) => {
  try {
    const { productId, targetPrice } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, 'A valid productId is required');
    }

    const numericTargetPrice = Number(targetPrice);

    if (!Number.isFinite(numericTargetPrice) || numericTargetPrice < 1) {
      throw new ApiError(400, 'targetPrice must be a number of at least 1');
    }

    const product = await Product.findById(productId).select('name currentPrice').lean().exec();

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      [
        {
          $set: {
            priceAlerts: {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ['$priceAlerts', []] },
                    as: 'alert',
                    cond: { $ne: ['$$alert.productId', product._id] }
                  }
                },
                [
                  {
                    _id: new mongoose.Types.ObjectId(),
                    productId: product._id,
                    targetPrice: Math.round((numericTargetPrice + Number.EPSILON) * 100) / 100,
                    notified: false
                  }
                ]
              ]
            }
          }
        }
      ],
      { new: true }
    )
      .select('priceAlerts')
      .populate({
        path: 'priceAlerts.productId',
        select: 'name category currentPrice mrp images'
      })
      .lean()
      .exec();

    res.status(201).json({
      message: 'Price alert saved successfully',
      alerts: updatedUser.priceAlerts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPriceAlert
};
