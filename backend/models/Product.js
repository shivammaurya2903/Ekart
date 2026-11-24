const mongoose = require('mongoose');

const CATEGORIES = ['Mobiles', 'Laptops', 'Footwear', 'Audio', 'Accessories'];

const sanitizeProduct = (doc, ret) => {
  ret.id = ret._id.toString();
  if (ret.specs instanceof Map) {
    ret.specs = Object.fromEntries(ret.specs.entries());
  }
  return ret;
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [160, 'Product name cannot exceed 160 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category'
      },
      index: true
    },
    specs: {
      type: Map,
      of: String,
      default: () => new Map()
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [1, 'Current price must be at least 1'],
      index: true
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [1, 'MRP must be at least 1']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number'
      }
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5']
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.every((image) => typeof image === 'string' && image.trim().length > 0),
        message: 'Every image must be a non-empty URL string'
      }
    },
    priceHistory: [
      {
        price: {
          type: Number,
          required: [true, 'History price is required'],
          min: [1, 'History price must be at least 1']
        },
        date: {
          type: Date,
          default: Date.now,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: sanitizeProduct
    },
    toObject: {
      virtuals: true,
      transform: sanitizeProduct
    }
  }
);

productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ category: 1, currentPrice: 1 });
productSchema.index({ currentPrice: -1 });

productSchema.virtual('lowestHistoricalPrice').get(function getLowestHistoricalPrice() {
  const prices = (this.priceHistory || [])
    .map((entry) => Number(entry.price))
    .filter((price) => Number.isFinite(price));

  if (Number.isFinite(this.currentPrice)) {
    prices.push(Number(this.currentPrice));
  }

  return prices.length > 0 ? Math.min(...prices) : 0;
});

productSchema.pre('validate', function validatePriceRange(next) {
  if (Number.isFinite(this.currentPrice) && Number.isFinite(this.mrp) && this.currentPrice > this.mrp) {
    next(new Error('Current price cannot be greater than MRP'));
  } else {
    next();
  }
});

productSchema.statics.CATEGORIES = CATEGORIES;

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
