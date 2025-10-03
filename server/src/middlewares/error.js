// src/middlewares/error.js

/**
 * NOTE: The code below assumes you have defined and imported the ApiError class.
 * Since your application uses ApiError (thrown by isAuthenticated and 404 handler), 
 * we must ensure the error middleware handles it correctly.
 * * We define a simple custom ErrorHandler class here to wrap standard errors 
 * and keep the final response clean and predictable.
 */

// Placeholder for ApiError (assuming its definition is available in utils)
// If ApiError is used, we prefer its structured fields (statusCode, message, errors).
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Helper class to normalize unexpected errors (like CastError or JWT errors)
class CustomErrorHandler extends ApiError {
    constructor(message, statusCode) {
        super(statusCode, message);
    }
}


export const errorMiddleware = (err, req, res, next) => {
    // 1. Initialize error properties, prioritizing existing ones (like those from ApiError)
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error.";
    let errors = err.errors || [];
    
    // 2. Handle specific, non-ApiError Node/Mongoose errors by remapping them to structured ApiError/CustomErrorHandler
    
    // Mongoose CastError (e.g., invalid ID format)
    if (err.name === "CastError") {
        const customMessage = `Invalid Resource ID: ${err.path}`;
        err = new CustomErrorHandler(customMessage, 400);
        statusCode = err.statusCode;
        message = err.message;
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        const customMessage = "Authentication failed. Invalid or expired token.";
        err = new CustomErrorHandler(customMessage, 401);
        statusCode = err.statusCode;
        message = err.message;
    }
    
    // Mongoose Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(", ");
        const customMessage = `Duplicate field value entered: ${field} already exists.`;
        err = new CustomErrorHandler(customMessage, 400);
        statusCode = err.statusCode;
        message = err.message;
    }

    // 3. Log the error stack in development for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error ${statusCode}]: ${message}`);
        console.error(err.stack);
    }

    // 4. Send guaranteed JSON response (THE FINAL FIX)
    return res.status(statusCode).json({
        success: false, // This is explicitly false for ALL errors, eliminating HTML responses
        message: message,
        errors: errors,
        // Only include stack trace in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

// Export ErrorHandler for consistency, although ApiError is generally preferred
export default CustomErrorHandler;
