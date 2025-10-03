/**
 * @description Yeh ek custom class hai jo successful API responses ko structure karne ke kaam aati hai.
 * Isse hum hamesha ek consistent format me data frontend ko bhejte hain, jisme
 * status code, data, aur ek success message hota hai.
 * Example: res.status(200).json(new ApiResponse(200, userData, "User logged in successfully"));
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = true; // The success flag is always true for an API response
    }
}

export { ApiResponse };