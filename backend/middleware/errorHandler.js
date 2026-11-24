class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, ApiError);
  }
}

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} was not found`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong';
  let details;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${String(err.value)}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.entries(err.errors || {}).map(([field, error]) => ({
      field,
      message: error.message
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    message = fields.length > 0 ? `Duplicate value for ${fields.join(', ')}` : 'Duplicate value not allowed';
    details = err.keyValue;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  } else if (err.error && err.error.code && err.error.description) {
    statusCode = 400;
    message = err.error.description;
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('[error]', err);
  }

  const response = {
    success: false,
    message
  };

  if (details !== undefined) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler
};
