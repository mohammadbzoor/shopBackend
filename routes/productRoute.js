const express = require('express');
const reviewRouter = require('./reviewRoute')
const {
    getProductValidator,
    createProductValidator,
    updateProductValidator,
    deleteProductValidator
}= require('../utils/validators/productValidator')
const {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    resizeProductImage,
    
} = require('../services/productServices');

const authService= require("../services/authService")

const router = express.Router();

// Post   / products/lasadkjgnklas25/reviews
// Get    / products/lasadkjgnklas25/reviews
// Get    / products/lasadkjgnklas25/reviews/545sagsd

router.use('/:productId/reviews',reviewRouter)

router.route('/')

.get(getProducts)
.post(authService.protect,authService.allowedTo('admin','manager'),uploadProductImages,resizeProductImage,createProductValidator, createProduct);


router.route('/:id')

.get(getProductValidator, getProductById)
.put(authService.protect,authService.allowedTo('admin','manager'),uploadProductImages,resizeProductImage,updateProductValidator, updateProduct)
.delete(authService.protect,authService.allowedTo('admin','manager'),deleteProductValidator, deleteProduct);


module.exports = router;

