const {check,body} = require('express-validator');
const slugify = require('slugify');
const ValidatorMaddileware =require('../../middlewares/validatorMiddleware')



exports.getCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid category ID Format'),
    ValidatorMaddileware,

]
exports.createCategoryValidator=[
    check("name")
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({min:3})
    .withMessage('Category name must be at least 3 characters long')
    .isLength({max:50})
    .withMessage('Category name must be at most 50 characters long'),
        body('name').custom((val,{req})=>{

        req.body.slug = slugify(val);
        return true;
    }),
    ValidatorMaddileware,
]

exports.updateCategoryValidator=[
       check('id').isMongoId().withMessage('Invalid category ID Format'),
        body('name').optional().custom((val,{req})=>{
       
               req.body.slug = slugify(val);
               return true;
           }),
    ValidatorMaddileware,

]

exports.deleteCategoryValidator=[
    check('id')
    .isMongoId()
    .withMessage('Invalid category ID Format'),
    ValidatorMaddileware,

]