const asyncHandler = require('express-async-handler');
const UserModle = require('../models/userModle');


// @desc Add product to user's wishlist
// @route POST /api/v1/users/wishlist
// @access Protected/User

exports.addProdcutToWishlist = asyncHandler(async (req, res, next) => {
    // $addToSet =>  add productId to wishlist array if it doesn't already exist
    const user = await UserModle.findByIdAndUpdate(req.user._id,{
        $addToSet:{whishlist:req.body.productId}
    },{new:true});

    res.status(200).json({
        status: 'success',
        message:'Product added successfully to wishlist ',
        data:user.whishlist,
    });
})

// @desc Remove product from user's wishlist
// @route DELETE /api/v1/users/wishlist:productId
// @access Protected/User

exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
    // $pull => remove productId from wishlist array if productId exists
    const user = await UserModle.findByIdAndUpdate(req.user._id,{
        $pull:{whishlist:req.params.productId}
    },{new:true});

    res.status(200).json({
        status: 'success',
        message:'Product removed successfully from wishlist ',
        data:user.whishlist,
    });
})

// @desc GET Logged-in user's wishlist
// @route GET /api/v1/wishlist
// @access Protected/User

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
    const user = await UserModle.findById(req.user._id).populate('whishlist');

    res.status(200).json({
        status: 'success',
        results: user.whishlist.length,
        data:user.whishlist,
    });
})