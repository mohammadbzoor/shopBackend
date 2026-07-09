const express = require('express');
// const {
//     getBrandValidator,
//     createBrandValidator,
//     updateBrandValidator,
//     deleteBrandValidator
// }= require('../utils/validators/BrandValidator')
const {
    getCoupons,
    createCoupon,
    getCouponById,
    updateCoupon,
    deleteCoupon,
} = require('../services/couponService');

const authService= require("../services/authService")

const router = express.Router();


router.use(authService.protect,authService.allowedTo('admin','manager'));
router.route('/')
.get(getCoupons)
.post(createCoupon);


router.route('/:id')

.get(getCouponById)
.put(updateCoupon)
.delete(deleteCoupon);


module.exports = router;

