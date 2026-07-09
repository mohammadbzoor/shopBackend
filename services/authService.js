/* eslint-disable no-undef */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const crypto=require('crypto')

const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const asyncHandler=require('express-async-handler')
const ApiError = require('../utils/apiError');
const UserModle = require('../models/userModle');
const sendEmail=require('../utils/sendEmail');
const createToken=require('../utils/createToken')

// @desc  signup
// @route POST /api/v1/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
    const user = await UserModle.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    const token = createToken(user._id);
    res.status(201).json({ data: user, token });
});

// @desc  login
// @route POST /api/v1/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const user = await UserModle.findOne({ email: req.body.email }); 

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) { 
        return next(new ApiError("Incorrect email or password", 401));
    }

    const token = createToken(user._id); 
    res.status(200).json({ data: user, token });
});


// @desc make sure the user is logged in 

exports.protect=asyncHandler(async (req, res, next)=>{
    // 1) check if token exist , if exist get
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new ApiError('You are not logged in, please login to get access to this route',401));
    }

    // 2) verify token (no change happens, expired token)
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        return next(new ApiError('Invalid token, Please login again', 401));
    }

    // 3) check if User exists
    const currentUser = await UserModle.findById(decoded.userId);
    if(!currentUser){
        return next(new ApiError('The user that belongs to this token does no longer exist',401));
    }
    // 3.5) check if account is active
    if (!currentUser.active) {
    return next(
        new ApiError(
            'Your account is not activated. Please activate your account first.',
            403
        )
    );
   }
    // 4) check if user changed password after token created(Error)
    if(currentUser.passwordCangedAt){
        const passChangedTimestamp = parseInt(currentUser.passwordCangedAt.getTime()/1000,10);
        // password changed after token
        if(passChangedTimestamp > decoded.iat){
            return next(new ApiError("User recently changed his password. Please login again...",401));
        }
    }
    req.user = currentUser;
    next();
})

// @desc make Authorization (User permation)
// ["admin","manager"]
// eslint-disable-next-line arrow-body-style
exports.allowedTo=(...roles)=>{
    //1) access roles
    //2) access registered user(req.user.role)
    return asyncHandler(async (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ApiError('You are not allowed to access this route ',401));
        }
        next();
    })}


// @desc  Forgot password
// @route POST /api/v1/forgotPassword
// @access Public
exports.forgotPassword=asyncHandler(async (req,res,next)=>{

    //1) Get user by email
    const user=await UserModle.findOne({email:req.body.email});
    if(!user){
        return next(new ApiError(`There is no user with email ${req.body.email}`,404))
    }
    //2) if user exist , Generate hash reset random 6 digits and save it in db
    const resetCode=Math.floor(10000+ Math.random() * 900000).toString();
    const hashedResetCode=crypto.createHash('sha256').update(resetCode).digest('hex');
   //Save hashed password reset code into db
   user.passwordResetCode = hashedResetCode;
   // Add expiration time for password reset code (10 min)
   user.passwordResetExpires = Date.now() + 10*60*1000;
   
   user.passwordResetVerified=false;
   await user.save();


    //3) send the reset code email
const message = 
   `Hi ${user.name},\nWe received a request to reset the password on your E-shop Account.\nYour reset code is: ${resetCode}\nEnter this code to complete the reset.\nRegards,\nE-shop Account Team`;
    try{
        await sendEmail({
        email:user.email,
        subject:"Your password reset code (valid for 10 min) ",
        message,
    
    })
    }
    catch(err){
        user.passwordResetCode=undefined;
        user.passwordResetExpires=undefined;
        user.passwordResetVerified=undefined;
        await user.save();
        return next(new ApiError("There is error in sending email",500));

    }
    res.status(200).json({status:"Success",message:"Reset Code sent to email"})

});


// @desc  verify reset password
// @route POST /api/v1/verifyResetCode
// @access Public

exports.verifyPasswordResetCode=asyncHandler(async (req,res,next)=>{
    //1) get user based on resetCode into body
        const hashedResetCode=crypto
        .createHash('sha256')
        .update(req.body.resetCode)
        .digest('hex');

        const user = await UserModle.findOne({
            passwordResetCode: hashedResetCode,
            passwordResetExpires: { $gt: Date.now() },

        })
        if(!user){
            return next(new ApiError('Reset Code Invalid Or Expired'))
        }

    //2)Reset Code valid
    user.passwordResetVerified=true;
    await user.save();
    res.status(200).json({status:'Success'})
})

// @desc Reset password
// @route POST /api/v1/resetPassword
// @access Public

exports.resetPassword=asyncHandler(async (req,res,next)=>{
    //1) Get User Based On Email
    const user=await UserModle.findOne({email:req.body.email})
    if(!user){
        return next(new ApiError(`There is no email ${req.body.email}`,404))
    }

    //2) Check if reset Code Verified
    if(!user.passwordResetVerified){
        return next(new ApiError(`Reset Code not verified`,400))
    }
   
    user.password = req.body.newPassword;
    user.passwordResetCode=undefined;
    user.passwordResetExpires=undefined;
    user.passwordResetVerified=undefined;

    await user.save()

    //3) if evry =thing is ok , generate token
    const token = createToken(user._id);
    res.status(200).json({token})
});