const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorHandler');

const CATEGORIES = Product.CATEGORIES;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const validatePositiveNumber = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 1) {
    throw new ApiError(400, `${fieldName} must be a number greater than or equal to 1`);
  }

  return roundMoney(number);
};

const validateSpecs = (specs) => {
  if (specs === undefined || specs === null) {
    return {};
  }

  if (typeof specs !== 'object' || Array.isArray(specs)) {
    throw new ApiError(400, 'specs must be an object of key-value pairs');
  }

  const normalized = {};

  for (const [key, value] of Object.entries(specs)) {
    const trimmedKey = key.trim();

    if (!trimmedKey) {
      throw new ApiError(400, 'specs keys cannot be empty');
    }

    if (value === null || value === undefined || typeof value === 'object') {
      throw new ApiError(400, `specs.${trimmedKey} must be a string value`);
    }

    const trimmedValue = String(value).trim();

    if (!trimmedValue) {
      throw new ApiError(400, `specs.${trimmedKey} cannot be empty`);
    }

    normalized[trimmedKey] = trimmedValue;
  }

  return normalized;
};

const validateImages = (images) => {
  if (images === undefined || images === null) {
    return [];
  }

  if (!Array.isArray(images) || images.some((image) => typeof image !== 'string' || !image.trim())) {
    throw new ApiError(400, 'images must be an array of non-empty URL strings');
  }

  return images.map((image) => image.trim());
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null) {
    return 0;
  }

  const number = Number(rating);

  if (!Number.isFinite(number) || number < 0 || number > 5) {
    throw new ApiError(400, 'rating must be a number between 0 and 5');
  }

  return number;
};

const validateStock = (stock) => {
  if (stock === undefined || stock === null) {
    return 0;
  }

  const number = Number(stock);

  if (!Number.isInteger(number) || number < 0) {
    throw new ApiError(400, 'stock must be a non-negative whole number');
  }

  return number;
};

const serializeProduct = (product) => {
  const plain = product && typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
  const priceHistory = Array.isArray(plain.priceHistory)
    ? [...plain.priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];
  const prices = priceHistory
    .map((entry) => Number(entry.price))
    .filter((price) => Number.isFinite(price));

  if (Number.isFinite(Number(plain.currentPrice))) {
    prices.push(Number(plain.currentPrice));
  }

  return {
    ...plain,
    id: plain.id || (plain._id ? plain._id.toString() : undefined),
    priceHistory,
    lowestHistoricalPrice: prices.length > 0 ? Math.min(...prices) : 0
  };
};

const listProducts = async (req, res, next) => {
  try {
    const filter = {};
    const { search, category, maxPrice } = req.query;

    if (typeof search === 'string' && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: pattern }, { category: pattern }];
    }

    if (typeof category === 'string' && category.trim()) {
      const normalizedCategory = category.trim();

      if (!CATEGORIES.includes(normalizedCategory)) {
        throw new ApiError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
      }

      filter.category = normalizedCategory;
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const numericMaxPrice = Number(maxPrice);

      if (!Number.isFinite(numericMaxPrice) || numericMaxPrice < 0) {
        throw new ApiError(400, 'maxPrice must be a non-negative number');
      }

      filter.currentPrice = { $lte: roundMoney(numericMaxPrice) };
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 60);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Product.countDocuments(filter).exec()
    ]);

    res.json({
      products: products.map(serializeProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).exec();

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json(serializeProduct(product));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, currentPrice, mrp } = req.body || {};
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';
    const numericCurrentPrice = validatePositiveNumber(currentPrice, 'currentPrice');
    const numericMrp = validatePositiveNumber(mrp, 'mrp');

    if (trimmedName.length < 2 || trimmedName.length > 160) {
      throw new ApiError(400, 'name must be between 2 and 160 characters long');
    }

    if (!CATEGORIES.includes(normalizedCategory)) {
      throw new ApiError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
    }

    if (numericCurrentPrice > numericMrp) {
      throw new ApiError(400, 'currentPrice cannot be greater than mrp');
    }

    const now = new Date();
    const product = await Product.create({
      name: trimmedName,
      category: normalizedCategory,
      specs: validateSpecs(req.body.specs),
      currentPrice: numericCurrentPrice,
      mrp: numericMrp,
      stock: validateStock(req.body.stock),
      rating: validateRating(req.body.rating),
      images: validateImages(req.body.images),
      priceHistory: [{ price: numericCurrentPrice, date: now }]
    });

    res.status(201).json(serializeProduct(product));
  } catch (error) {
    next(error);
  }
};

const updateProductPrice = async (req, res, next) => {
  try {
    const newPrice = validatePositiveNumber(req.body && req.body.currentPrice, 'currentPrice');
    const product = await Product.findById(req.params.id).exec();

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (newPrice > product.mrp) {
      throw new ApiError(400, 'currentPrice cannot be greater than mrp');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: { currentPrice: newPrice },
        $push: { priceHistory: { price: newPrice, date: new Date() } }
      },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedProduct) {
      throw new ApiError(404, 'Product not found');
    }

    res.json(serializeProduct(updatedProduct));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id).exec();

    if (!deletedProduct) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      message: 'Product deleted successfully',
      productId: deletedProduct._id.toString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProductPrice,
  deleteProduct
};
