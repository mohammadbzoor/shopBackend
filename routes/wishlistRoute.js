const express = require('express');
const {
    addProdcutToWishlist,
    removeProductFromWishlist,
    getLoggedUserWishlist,
} = require('../services/whishlistService');
const {
    addProductToWishlistValidator,
    removeProductFromWishlistValidator,
} = require('../utils/validators/wishlistValidator');

const authService= require("../services/authService")

const router = express.Router();


router.use(authService.protect,authService.allowedTo('user'));
router.route('/').post(addProductToWishlistValidator, addProdcutToWishlist).get(getLoggedUserWishlist);

router.route('/:productId').delete(removeProductFromWishlistValidator, removeProductFromWishlist);


module.exports = router;

