const express = require('express');
const {
    getReviewValidator,
    createReviewValidator,
    updateReviewValidator,
    deleteReviewValidator
}= require('../utils/validators/reviewValidator')
const {
    getReviews,
    createReview,
    getReviewById,
    updateReview,
    deleteReview,
    createFilterObj,
    setProductIdToBody,

} = require('../services/reviewServices');

const authService= require("../services/authService")

const router = express.Router({mergeParams:true}); // mergeParams:true to access productId from parent route    


router.route('/')

.get(createFilterObj,getReviews)
.post(authService.protect,authService.allowedTo('user'),setProductIdToBody,createReviewValidator, createReview);


router.route('/:id')

.get(getReviewValidator, getReviewById)
.put(authService.protect,updateReviewValidator,authService.allowedTo('user')
, updateReview)
.delete(authService.protect,deleteReviewValidator,authService.allowedTo('user','manager','admin'),
deleteReview);


module.exports = router;

