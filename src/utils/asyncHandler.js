export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    return res
      .status(error?.statusCode || 500)
      .json({ message: error.message || "Something went wrong.." });
  }
};

export class ApiResponse {
  constructor(statusCode, message, success = true, data) {
    this.data = data;
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
  }
}

export class ApiError extends Error {
  constructor(statusCode, message, stack) {
    super();
    this.statusCode = statusCode;
    this.message = message;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
