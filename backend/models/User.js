const mongoose = require('mongoose');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret.passwordHash;
  delete ret.__v;
  return ret;
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'customer',
      index: true
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Cart item product is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Cart item quantity is required'],
          min: [1, 'Cart item quantity must be at least 1'],
          validate: {
            validator: Number.isInteger,
            message: 'Cart item quantity must be a whole number'
          }
        }
      }
    ],
    priceAlerts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Alert product is required']
        },
        targetPrice: {
          type: Number,
          required: [true, 'Target price is required'],
          min: [1, 'Target price must be at least 1']
        },
        notified: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: sanitizeUser
    },
    toObject: {
      virtuals: true,
      transform: sanitizeUser
    }
  }
);

userSchema.index({ 'priceAlerts.notified': 1 });
userSchema.index({ 'priceAlerts.productId': 1, 'priceAlerts.notified': 1 });
userSchema.index({ 'cart.productId': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
