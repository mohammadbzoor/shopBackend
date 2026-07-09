const asyncHandler = require('express-async-handler');
const UserModle = require('../models/userModle');


// @desc Add address to user's addresses
// @route POST /api/v1/addresses
// @access Protected/User

exports.addAddress = asyncHandler(async (req, res, next) => {
    // $addToSet =>  add address to addresses array if it doesn't already exist
    const user = await UserModle.findByIdAndUpdate(req.user._id,{
        $addToSet:{addresses:req.body}
    },{new:true});

    res.status(200).json({
        status: 'success',
        message:'Address added successfully to addresses ',
        data:user.addresses,
    });
})

// @desc Remove address object from user's addresses array if address exists
// @route DELETE /api/v1/addresses/:addressId
// @access Protected/User

exports.removeAddress = asyncHandler(async (req, res, next) => {
    // $pull => remove address from addresses array if address exists
    const user = await UserModle.findByIdAndUpdate(req.user._id,{
        $pull:{addresses:{_id: req.params.addressId}}
    },{new:true});

    res.status(200).json({
        status: 'success',
        message:'Address removed successfully from addresses ',
        data:user.addresses,
    });
})

// @desc GET Logged-in user addresses
// @route GET /api/v1/addresses
// @access Protected/User

exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
    const user = await UserModle.findById(req.user._id).populate('addresses');

    res.status(200).json({
        status: 'success',
        results: user.addresses.length,
        data:user.addresses,
    });
})