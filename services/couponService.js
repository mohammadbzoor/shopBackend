const CouponModle = require('../models/couponModel');
const factory= require('./handlersFactory')


// @desc Get List of coupons
// @route GET /api/v1/coupons
// @access private/Admin-Manger
exports.getCoupons = factory.getAll(CouponModle);

// @ desc Get Spesific coupon by id
// @route GET /api/v1/coupons/:id
// @access private/Admin-Manger
exports.getCouponById= factory.getOne(CouponModle);



// @desc Create a new coupon
// @route POST /api/v1/coupons
// @access private/Admin-Manger
exports.createCoupon =factory.createOne(CouponModle);


// @desc Update a coupon
// @route PUT /api/v1/coupons/:id
// @access private/Admin-Manger

exports.updateCoupon = factory.updateOne(CouponModle);


// @desc Delete a coupon        
// @route DELETE /api/v1/coupons/:id
// @access private/Admin-Manger

exports.deleteCoupon = factory.deleteOne(CouponModle);
