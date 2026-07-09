/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

const  sharp=require('sharp')
const {v4:uuidv4}=require('uuid')
const asyncHandler=require('express-async-handler')
const BrandModle = require('../models/brandModle');
const factory= require('./handlersFactory')
const { uploadSingleImage } = require('../middlewares/uploadImageMiddlewere');

// 1- then()  catch(err)
// 2- try{}   catch(err)
// 3- asyncHandler(async) => express error handler =>  npm i --save express-async-handler

// Upload Single Image
exports.uploadBrandImage=uploadSingleImage('image');
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .rotate() // يقرأ اتجاه الصورة من EXIF ويصححه
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`uploads/brands/${filename}`);
    // save image into our db
    req.body.image = filename;
    //save urlImage into our db
//    req.body.image =req.hostname+filename;
    

    next();
});


// @desc Get List of brands
// @route GET /api/v1/brands
// @access Public
exports.getBrands = factory.getAll(BrandModle);

// @ desc Get Spesific brand by id
// @route GET /api/v1/brands/:id
// @access Public 
exports.getBrandById= factory.getOne(BrandModle);



// @desc Create a new brand
// @route POST /api/v1/brands
// @access Private
exports.createBrand =factory.createOne(BrandModle);


// @desc Update a brand
// @route PUT /api/v1/brands/:id
// @access Private

exports.updateBrand = factory.updateOne(BrandModle);


// @desc Delete a brand
// @route DELETE /api/v1/brands/:id
// @access Private

exports.deleteBrand = factory.deleteOne(BrandModle);
