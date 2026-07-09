/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
const bcrypt=require('bcryptjs');
const  sharp=require('sharp')
const {v4:uuidv4}=require('uuid')
const asyncHandler=require('express-async-handler')
const UserModle = require('../models/userModle');
const factory= require('./handlersFactory')
const { uploadSingleImage } = require('../middlewares/uploadImageMiddlewere');
const ApiError = require('../utils/apiError');
const createToken=require('../utils/createToken')


// Upload Single Image
exports.uploadUserImage=uploadSingleImage('profileImg');
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
   if(req.file){
    await sharp(req.file.buffer)
        .rotate() // يقرأ اتجاه الصورة من EXIF ويصححه
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`uploads/users/${filename}`);
    // save image into our db
    req.body.profileImg = filename;
   }

    

    next();
});


// @desc Get List of users
// @route GET /api/v1/users
// @access Private
exports.getUsers = factory.getAll(UserModle);

// @ desc Get Spesific user by id
// @route GET /api/v1/users/:id
// @access Private 
exports.getUserById= factory.getOne(UserModle);



// @desc Create a new user
// @route POST /api/v1/users
// @access Private
exports.createUser =factory.createOne(UserModle);


// @desc Update a user
// @route PUT /api/v1/users/:id
// @access Private
exports.updateUser =asyncHandler(async (req, res,next) => {
        const document = await UserModle.findByIdAndUpdate(
            req.params.id,
            {
                name:req.body.name,
                slug:req.body.slug,
                phone:req.body.phone,
                email:req.body.email,
                profileImg:req.body.profileImg,
                role:req.body.role,
            },
            {new:true})
    
        if (!document) {
            return next(new ApiError(`No document for this id ${req.params.id}`, 404));
        }
        res.status(200).json({data: document});
    });

    exports.changeUserPassword =asyncHandler(async (req, res,next) => {
        const document = await UserModle.findByIdAndUpdate(
            req.params.id,
            {
              password:await bcrypt.hash(req.body.password,12),
              passwordCangedAt:Date.now(),

            },
            {new:true})
    
        if (!document) {
            return next(new ApiError(`No document for this id ${req.params.id}`, 404));
        }
        res.status(200).json({data: document});
    });

// @desc Delete a user
// @route DELETE /api/v1/users/:id
// @access Private

exports.deleteUser = factory.deleteOne(UserModle);


// @desc Logged user data
// @route Get /api/v1/getMe
// @access Private/protect

exports.getLoggedUserData=asyncHandler(async (req,res,next)=>{
    req.params.id=req.user._id;
    next()
})

// @desc Update user password
// @route Put /api/v1/updateMyPassword
// @access Private/protect

exports.updateLoggedUserPassword=asyncHandler(async (req, res,next) => {
    // 1) update user password base user payload (req.user._id)

        
     const user = await UserModle.findByIdAndUpdate(
        req.user._id,
            {
              password:await bcrypt.hash(req.body.password,12),
              passwordCangedAt:Date.now(),

            },
            {new:true});

        //2) Generate token

    const token = createToken(user._id)
    res.status(200).json({data:user,token})
    
    });


// @desc Update user data{ without password ,role}
// @route Put /api/v1/uodateMe
// @access Private/protect

exports.updateLoggedUserData= asyncHandler(async (req, res,next)=>{
    const updateUser= await UserModle.findByIdAndUpdate(req.user._id,{
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
    },
    {new:true}

);
res.status(200).json({data:updateUser})
})

// @desc deactivate logged user
// @route Delete /api/v1/uodateMe
// @access Private/protect

exports.deleteLoggedUserData= asyncHandler(async (req, res,next)=>{
    await UserModle.findByIdAndUpdate(req.user._id,{active:false});

    res.status(204).json({status:"Success"})
})