const crypto = require('crypto');
const mongoose = require('mongoose');
const getRazorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { calculateCartTotals, getCleanedCart } = require('./cartController');
const { ApiError } = require('../middleware/errorHandler');

const CURRENCY = (process.env.RAZORPAY_CURRENCY || 'INR').toUpperCase();

const toPaise = (amount) => Math.round(Number(amount) * 100);

const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    throw new ApiError(400, 'shippingAddress is required');
  }

  const requiredFields = ['fullName', 'street', 'city', 'state', 'pincode', 'phone'];
  const normalized = {};

  for (const field of requiredFields) {
    const value = address[field];

    if (typeof value !== 'string' || !value.trim()) {
      throw new ApiError(400, `shippingAddress.${field} is required`);
    }

    normalized[field] = value.trim();
  }

  if (!/^[1-9][0-9]{5}$/.test(normalized.pincode)) {
    throw new ApiError(400, 'shippingAddress.pincode must be a valid 6-digit Indian pincode');
  }

  if (!/^[6-9][0-9]{9}$/.test(normalized.phone)) {
    throw new ApiError(400, 'shippingAddress.phone must be a valid 10-digit Indian mobile number');
  }

  return normalized;
};

const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new ApiError(500, 'RAZORPAY_KEY_SECRET is not configured');
  }

  if (!/^[a-f0-9]{64}$/i.test(razorpaySignature)) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(razorpaySignature.toLowerCase(), 'utf8')
  );
};

const createPayment = async (req, res, next) => {
  try {
    const shippingAddress = validateShippingAddress(req.body && req.body.shippingAddress);
    const cart = await getCleanedCart(req.user.id);

    if (cart.length === 0) {
      throw new ApiError(400, 'Your cart is empty');
    }

    for (const item of cart) {
      if (!item.productId || item.productId.stock < item.quantity) {
        const itemName = (item.productId && item.productId.name) || 'An item';
        throw new ApiError(400, `${itemName} is out of stock`);
      }
    }

    const totals = calculateCartTotals(cart);

    if (totals.totalAmount <= 0) {
      throw new ApiError(400, 'Cart total must be greater than zero');
    }

    const amount = toPaise(totals.totalAmount);
    const receipt = `ekart_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    const razorpayOrder = await getRazorpay().orders.create({
      amount,
      currency: CURRENCY,
      receipt,
      notes: {
        userId: String(req.user.id),
        purpose: 'ekart-checkout'
      }
    });

    const { items, ...priceBreakdown } = totals;
    const order = await Order.create({
      userId: req.user.id,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity
      })),
      priceBreakdown,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending'
    });

    res.status(201).json({
      orderId: order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
      priceBreakdown
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(400, 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required');
    }

    if (
      typeof razorpayOrderId !== 'string' ||
      typeof razorpayPaymentId !== 'string' ||
      typeof razorpaySignature !== 'string'
    ) {
      throw new ApiError(400, 'Razorpay payment fields must be strings');
    }

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new ApiError(400, 'Invalid Razorpay payment signature');
    }

    const order = await Order.findOne({
      razorpayOrderId,
      userId: req.user.id
    }).exec();

    if (!order) {
      throw new ApiError(404, 'Order not found for this payment');
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        message: 'Payment was already verified',
        order,
        priceBreakdown: order.priceBreakdown
      });
    }

    if (order.paymentStatus !== 'pending') {
      throw new ApiError(409, `Order payment status is ${order.paymentStatus}`);
    }

    const session = await mongoose.startSession();
    let paidOrder;

    try {
      session.startTransaction();

      paidOrder = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: 'pending' },
        {
          $set: {
            paymentStatus: 'paid',
            razorpayPaymentId: razorpayPaymentId
          }
        },
        { new: true, session }
      ).exec();

      if (!paidOrder) {
        throw new ApiError(409, 'Order is no longer pending');
      }

      for (const item of paidOrder.items) {
        const stockUpdate = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        ).exec();

        if (!stockUpdate) {
          throw new ApiError(409, `${item.name} no longer has enough stock`);
        }
      }

      await User.updateOne(
        { _id: req.user.id },
        { $set: { cart: [] } },
        { session }
      ).exec();

      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }

    res.json({
      message: 'Payment verified successfully',
      order: paidOrder,
      priceBreakdown: paidOrder.priceBreakdown
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean().exec();

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  getMyOrders
};
