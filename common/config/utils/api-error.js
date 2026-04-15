

class ApiError extends Error {

    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad Request") {
        return new ApiError(400, message)
    }

    static unAuthorized(message = "Unauthorized") {
        return new ApiError(401, message)
    }

    static notFound(message = "User not found") {
        return new ApiError(404, message)
    }

    static conflict(message = "Conflict") {
        return new ApiError(409, message)
    }
    
    static forbidden(message = "Forbidden") {
        return new ApiError(412, message)
    }
    
}

export default ApiError;