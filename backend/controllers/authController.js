const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

const BCRYPT_SALT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(400, 'Password must contain at least one letter and one number');
  }
};

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      throw new ApiError(400, 'Name must be between 2 and 80 characters long');
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    validatePassword(password);

    const existingUser = await User.exists({ email: normalizedEmail });

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: 'customer'
    });

    res.status(201).json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string' || password.length === 0) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash').exec();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    res.json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash')
      .populate({
        path: 'cart.productId',
        select: 'name category currentPrice mrp stock images'
      })
      .populate({
        path: 'priceAlerts.productId',
        select: 'name category currentPrice mrp images'
      })
      .lean()
      .exec();

    if (!user) {
      throw new ApiError(401, 'The account for this token no longer exists');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me
};
