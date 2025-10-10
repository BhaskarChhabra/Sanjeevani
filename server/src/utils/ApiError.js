/**
 * @description Yeh ek custom error class hai jo Node.js ki default Error class ko extend karti hai.
 * Iska fayda yeh hai ki hum apne project me ek consistent, structured error format bana sakte hain.
 * Hum isme HTTP status code, error messages, aur success status jaise extra details add kar sakte hain.
 * Example: throw new ApiError(404, "User not found");
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Call the parent constructor with the error message
        super(message);

        // Assign custom properties
        this.statusCode = statusCode;
        this.data = null; // Generally, error responses don't have data
        this.message = message;
        this.success = false; // The success flag is always false for an API error
        this.errors = errors; // Array to hold more detailed validation errors if any

        // Capture the stack trace, excluding the constructor call from it
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };