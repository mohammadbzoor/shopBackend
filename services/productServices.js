/* eslint-disable import/order */
/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const path = require('path')

const factory= require('./handlersFactory')
const productModel = require('../models/productModel')
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddlewere')


const uploadProductImages=uploadMixOfImages([{
    name:"imageCover",
    maxCount:1,
},{
    name:"images",
    maxCount:5,
}]);

exports.uploadProductImages = uploadProductImages;

exports.resizeProductImage = asyncHandler(async (req, res, next) => {
    // ensure target folder exists
    const productsUploadDir = path.join(__dirname, '../uploads/products')
    if (!fs.existsSync(productsUploadDir)) {
        fs.mkdirSync(productsUploadDir, { recursive: true })
    }

    // 1- image processing for imageCover
    if (req.files && req.files.imageCover && req.files.imageCover.length > 0) {
        const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
            .rotate() // يقرأ اتجاه الصورة من EXIF ويصححه
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toFile(path.join(productsUploadDir, imageCoverFilename));

        // save image into our db
        req.body.imageCover = imageCoverFilename;
    }

   if (req.files.images) {
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (img, index) => {
            const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(img.buffer)
                .rotate()
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 95 })
                .toFile(path.join(productsUploadDir, imageName));

            req.body.images.push(imageName);
        })
    );

    next();


}})

// @desc Get List of products
// @route GET /api/v1/products
// @access Public
exports.getProducts = factory.getAll(productModel,"Products");
 

// @ desc Get Spesific product by id
// @route GET /api/v1/products/:id
// @access Public 
exports.getProductById= factory.getOne(productModel,'reviews');



// @desc Create a new product
// @route POST /api/v1/products
// @access Private
exports.createProduct = factory.createOne(productModel);


// @desc Update a product
// @route PUT /api/v1/products/:id
// @access Private

exports.updateProduct = factory.updateOne(productModel);

// @desc Delete a product
// @route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = factory.deleteOne(productModel);

