const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong MongoDB ID error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Ensure a valid status code
  if (!err.statusCode || typeof err.statusCode !== "number") {
    err.statusCode = 500;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
