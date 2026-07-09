/* eslint-disable arrow-body-style */

const ApiError = require("../utils/apiError");

/* eslint-disable no-use-before-define */
const handleJwtInvalidSignature =()=> new ApiError("Invalid token, Please Login again...",401);
const handleJwtExpired=()=>new ApiError("Expired token, Please Login again...",401);
const globalError= (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.name === 'JsonWebTokenError') {
// sourcery skip: dont-reassign-parameters
        err = handleJwtInvalidSignature();
    }
    if (err.name === 'TokenExpiredError') {
// sourcery skip: dont-reassign-parameters
        err = handleJwtExpired();
    }

    if (process.env.NODE_ENV === 'development'){
        sendErrorForDev(err,res);
    }
    else{
        sendErrorForProd(err,res);
    }
};
const sendErrorForDev =(err,res)=>{
   return res.status(err.statusCode || 400).json({ 
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
     });
}
const sendErrorForProd =(err,res)=>{
   return res.status(err.statusCode || 400).json({ 
        status: err.status,
        message: err.message,
     });
}
module.exports = globalError;