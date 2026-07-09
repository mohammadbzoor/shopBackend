const express = require('express');
// const {
//     getBrandValidator,
//     createBrandValidator,
//     updateBrandValidator,
//     deleteBrandValidator
// }= require('../utils/validators/BrandValidator')
const {
    addProductToCart,
    getLoggedUserCart,
    removeSpecificUserCart,
    clearCart,
    updateCartItemQuantity,
    applyCoupon,


} = require('../services/cartService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));
router.route('/')
.get(getLoggedUserCart)
.post(addProductToCart)
.delete(clearCart);

router.route('/applyCoupon')
.put(applyCoupon);

router.route('/:itemId')
.put(updateCartItemQuantity)
.delete(removeSpecificUserCart);

module.exports = router;

