const {check, body} = require('express-validator');
const ValidatorMaddileware =require('../../middlewares/validatorMiddleware')
const reviewModle = require('../../models/reviewModle');

exports.getReviewValidator=[
    check('id').isMongoId().withMessage('Invalid review ID Format'),
    ValidatorMaddileware,
]
exports.createReviewValidator=[
    check("title").optional(),

    check("ratings")
    .notEmpty()
    .withMessage('Review ratings required')
    .isFloat({min:1,max:5})
    .withMessage('Review ratings must be between 1.0 and 5.0'),
    check("product")
    .isMongoId()
    .withMessage('Invalid product ID Format').custom((val,{req})=>
        // Check if logged user created a review before
    reviewModle.findOne({user:req.user._id, product: val})
        .then((review) => {
            if (review) {
                return Promise.reject(new Error('You already created a review before'));
            }
            return true;
        })
    )  ,

        ValidatorMaddileware,
]

exports.updateReviewValidator=[
    check('id').isMongoId().withMessage('Invalid review ID Format')
    .custom((val,{req})=>
        // Check review ownership before update
        reviewModle.findById(val).then((review)=>{
            if(!review){
                return Promise.reject(new Error(`There is no review with id ${val}`));
            }
            if(review.user._id.toString() !== req.user._id.toString()){
                return Promise.reject(new Error(`You are not allowed to update this review`));
            }
        })
    ),
    body('title').optional(),

    ValidatorMaddileware,

]

exports.deleteReviewValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid review ID Format')
        .custom(async (val, { req }) => {

            const review = await reviewModle.findById(val);

            if (!review) {
                throw new Error(`There is no review with id ${val}`);
            }

            // Admin & Manager can delete any review
            if (
                req.user.role === 'admin' ||
                req.user.role === 'manager'
            ) {
                return true;
            }

            // User can delete only his own review
            if (review.user._id.toString() !== req.user._id.toString()) {
                throw new Error(
                    'You are not allowed to delete this review'
                );
            }

            return true;
        }),

    ValidatorMaddileware,
];