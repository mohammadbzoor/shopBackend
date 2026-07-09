const asyncHandler = require('express-async-handler');
const ReviewModle = require('../models/reviewModle');
const factory= require('./handlersFactory')


exports.setProductIdToBody=(req,res,next)=>{
    //Nested Route(Create review for spesific product)
    if(!req.body.product)req.body.product=req.params.productId;
    if(!req.body.user) req.body.user=req.user._id;
    next();
}

// Nested Route
// GET /api/products/:productId/reviews
exports.createFilterObj=(req,res,next)=>{
    let filterObject={};

    if(req.params.productId)filterObject={product:req.params.productId};
    req.filterObj=filterObject;
    
    next();
}


// @desc Get List of reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(ReviewModle);

// @ desc Get Spesific review by id
// @route GET /api/v1/reviews/:id
// @access Public 
exports.getReviewById= factory.getOne(ReviewModle);



// @desc Create a new review
// @route POST /api/v1/reviews
// @access Private/protect/user
exports.createReview = asyncHandler(async (req, res, next) => {
    // always use the logged-in user id, do not trust the client
    req.body.user = req.user._id;
    const newReview = await ReviewModle.create(req.body);
    res.status(201).json({ data: newReview });
});

// @desc Update a review
// @route PUT /api/v1/reviews/:id
// @access Private/protect/user

exports.updateReview = factory.updateOne(ReviewModle);


// @desc Delete a review
// @route DELETE /api/v1/reviews/:id
// @access Private/protect/user-Admin-Manager

exports.deleteReview = factory.deleteOne(ReviewModle);
