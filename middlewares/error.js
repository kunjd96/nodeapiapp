const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (error, req, res, next) => {

    let errordata = {...error };

    errordata.message = error.message;

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
        const message = `Resource not found`;
        errordata = new ErrorResponse(message, 404);
    }
    // Mongoose duplicate key
    if (error.code === 11000) {
        const message = 'Duplicate field value entered';
        errordata = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(val => val.message);
        errordata = new ErrorResponse(message, 400);
    }

    res.status(errordata.status || 500).json({
        success: false,
        error: errordata.message || 'Server Error'
    });
}

module.exports = errorHandler;