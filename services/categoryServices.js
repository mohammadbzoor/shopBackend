/* eslint-disable import/no-extraneous-dependencies */
const  sharp=require('sharp')
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const {v4:uuidv4}=require('uuid')
const asyncHandler=require('express-async-handler')
const CategoryModel = require('../models/categoryModel');
const factory= require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddlewere');


// 1- then()  catch(err)
// 2- try{}   catch(err)
// 3- asyncHandler(async) => express error handler =>  npm i --save express-async-handler
// Upload Single Image
exports.uploadCategoryImage=uploadSingleImage('image');
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    if(req.file){

        await sharp(req.file.buffer)
            .rotate() // يقرأ اتجاه الصورة من EXIF ويصححه
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 95 })
            .toFile(`uploads/categories/${filename}`);
        // save image into our db
        req.body.image = filename;
    }

    next();
});


// @desc Get List of categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(CategoryModel);

// @ desc Get Spesific category by id
// @route GET /api/v1/categories/:id
// @access Public 
exports.getCategoryById= factory.getOne(CategoryModel);



// @desc Create a new category
// @route POST /api/v1/categories
// @access Private
exports.createCategory = factory.createOne(CategoryModel);


// @desc Update a category
// @route PUT /api/v1/categories/:id
// @access Private

exports.updateCategory = factory.updateOne(CategoryModel);

// @desc Delete a category
// @route DELETE /api/v1/categories/:id
// @access Private
exports.deleteCategory = factory.deleteOne(CategoryModel);

