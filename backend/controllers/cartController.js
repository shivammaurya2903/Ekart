const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

const GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 49;
const CART_PRODUCT_FIELDS = 'name category currentPrice mrp stock images';

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const isPopulatedProduct = (item) => Boolean(
  item &&
    item.productId &&
    typeof item.productId === 'object' &&
    item.productId.currentPrice !== undefined &&
    Number.isFinite(Number(item.productId.currentPrice))
);

const calculateCartTotals = (cartItems = []) => {
  let subtotal = 0;
  let discount = 0;
  const items = [];

  for (const item of cartItems) {
    if (!isPopulatedProduct(item)) {
      continue;
    }

    const quantity = Number(item.quantity);
    const price = roundMoney(Number(item.productId.currentPrice));
    const mrp = roundMoney(Number(item.productId.mrp || price));
    const lineTotal = roundMoney(price * quantity);

    subtotal += lineTotal;
    discount += roundMoney(Math.max(0, mrp - price) * quantity);
    items.push({
      productId: item.productId._id,
      name: item.productId.name,
      priceAtPurchase: price,
      quantity,
      lineTotal
    });
  }

  subtotal = roundMoney(subtotal);
  discount = roundMoney(discount);
  const gst = roundMoney(subtotal * GST_RATE);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalAmount = roundMoney(subtotal + gst + deliveryFee);

  return {
    items,
    subtotal,
    gst,
    deliveryFee,
    discount,
    totalAmount
  };
};

const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId)
    .select('cart')
    .populate({
      path: 'cart.productId',
      select: CART_PRODUCT_FIELDS
    })
    .lean()
    .exec();

  return user ? user.cart || [] : [];
};

const cleanCartReferences = async (userId, cartItems) => {
  const validItems = cartItems.filter(isPopulatedProduct);
  const staleProductIds = cartItems
    .filter((item) => item.productId && !isPopulatedProduct(item))
    .map((item) => item.productId._id || item.productId);

  if (staleProductIds.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { productId: { $in: staleProductIds } } } }
    ).exec();
  }

  return validItems;
};

const getCleanedCart = async (userId) => {
  const cart = await getPopulatedCart(userId);
  return cleanCartReferences(userId, cart);
};

const getCartSummary = async (userId) => {
  const cart = await getCleanedCart(userId);
  const totals = calculateCartTotals(cart);
  const { items, ...priceBreakdown } = totals;

  return {
    cart,
    priceBreakdown
  };
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, 'A valid productId is required');
    }

    const numericQuantity = Number(quantity);

    if (!Number.isInteger(numericQuantity) || numericQuantity < 1) {
      throw new ApiError(400, 'quantity must be a whole number of at least 1');
    }

    const product = await Product.findById(productId)
      .select('name currentPrice mrp stock')
      .lean()
      .exec();

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.stock < numericQuantity) {
      throw new ApiError(400, `Only ${product.stock} units of ${product.name} are available`);
    }

    await User.findByIdAndUpdate(
      req.user.id,
      [
        {
          $set: {
            cart: {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ['$cart', []] },
                    as: 'item',
                    cond: { $ne: ['$$item.productId', product._id] }
                  }
                },
                [{ productId: product._id, quantity: numericQuantity }]
              ]
            }
          }
        }
      ],
      { new: true }
    ).exec();

    res.status(201).json(await getCartSummary(req.user.id));
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, 'A valid productId is required');
    }

    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { cart: { productId: new mongoose.Types.ObjectId(productId) } } }
    ).exec();

    res.json(await getCartSummary(req.user.id));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateCartTotals,
  getCleanedCart,
  getCartSummary,
  addToCart,
  removeFromCart
};
