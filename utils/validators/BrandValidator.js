const slugify = require('slugify');
const {check, body} = require('express-validator');
const ValidatorMaddileware =require('../../middlewares/validatorMiddleware')


exports.getBrandValidator=[
    check('id').isMongoId().withMessage('Invalid brand ID Format'),
    ValidatorMaddileware,

]
exports.createBrandValidator=[
    check("name")
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({min:3})
    .withMessage('Brand name must be at least 3 characters long')
    .isLength({max:32})
    .withMessage('Brand name must be at most 32 characters long'),
        body('name').custom((val,{req})=>{

        req.body.slug = slugify(val);
        return true;
    }),
    ValidatorMaddileware,
]

exports.updateBrandValidator=[
    check('id').isMongoId().withMessage('Invalid brand ID Format'),
    body('name').optional().custom((val,{req})=>{

        req.body.slug = slugify(val);
        return true;
    }),

    ValidatorMaddileware,

]

exports.deleteBrandValidator=[
    check('id')
    .isMongoId()
    .withMessage('Invalid brand ID Format'),
    ValidatorMaddileware,

]