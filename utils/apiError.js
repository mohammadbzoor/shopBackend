// @desc this class is responsible about oprational errors (errors that i can pridict )
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational=true;
    }
}
module.exports = ApiError;