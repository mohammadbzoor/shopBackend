const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const ProductModle = require('../../models/productModel');
const UserModle = require('../../models/userModle');

exports.addProductToWishlistValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid product ID')
        .custom(async (value) => {
            // Check if product exists in database
            const product = await ProductModle.findById(value);
            if (!product) {
                throw new Error('Product not found');
            }
        })
        .custom(async (value, { req }) => {
            // Check if product already exists in wishlist
            const user = await UserModle.findById(req.user._id);
            if (user && user.whishlist) {
                const productExists = user.whishlist.some(id => id.toString() === value);
                if (productExists) {
                    throw new Error('Product already exists in your wishlist');
                }
            }
        }),
    validatorMiddleware,
];

exports.removeProductFromWishlistValidator = [
    check('productId')
        .isMongoId()
        .withMessage('Invalid product ID')
        .custom(async (value, { req }) => {
            // Check if product exists in user's wishlist
            const user = await UserModle.findById(req.user._id);
            if (user && user.whishlist) {
                const productExists = user.whishlist.some(id => id.toString() === value);
                if (!productExists) {
                    throw new Error('Product not found in your wishlist');
                }
            } else {
                throw new Error('Wishlist not found');
            }
        }),
    validatorMiddleware,
];
