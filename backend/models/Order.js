const mongoose = require('mongoose');

const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order user is required'],
      index: true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Ordered product is required']
        },
        name: {
          type: String,
          required: [true, 'Item name is required'],
          trim: true
        },
        priceAtPurchase: {
          type: Number,
          required: [true, 'Item purchase price is required'],
          min: [0, 'Item purchase price cannot be negative']
        },
        quantity: {
          type: Number,
          required: [true, 'Item quantity is required'],
          min: [1, 'Item quantity must be at least 1'],
          validate: {
            validator: Number.isInteger,
            message: 'Item quantity must be a whole number'
          }
        }
      }
    ],
    priceBreakdown: {
      subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
      },
      gst: {
        type: Number,
        required: [true, 'GST is required'],
        min: [0, 'GST cannot be negative']
      },
      deliveryFee: {
        type: Number,
        required: [true, 'Delivery fee is required'],
        min: [0, 'Delivery fee cannot be negative']
      },
      discount: {
        type: Number,
        required: [true, 'Discount is required'],
        min: [0, 'Discount cannot be negative']
      },
      totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
      }
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
      },
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true,
        match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit Indian pincode']
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[6-9][0-9]{9}$/, 'Please provide a valid 10-digit Indian mobile number']
      }
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay order ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
