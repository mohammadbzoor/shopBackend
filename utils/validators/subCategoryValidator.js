const {check,body} = require('express-validator');
const slugify = require('slugify');
const ValidatorMaddileware =require('../../middlewares/validatorMiddleware')


exports.getSubCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid  Subcategory ID Format'),
    ValidatorMaddileware,

]

exports.createSubCategoryValidator=[
    check("name")
    .notEmpty()
    .withMessage(' SubCategory name is required')
    .isLength({min:2})
    .withMessage(' SubCategory name must be at least 2 characters long')
    .isLength({max:32})
    .withMessage(' SubCategory name must be at most 32 characters long'),
    check('category')
    .notEmpty()
    .withMessage('subCategory must be belong to category')
    .isMongoId()
    .withMessage("Invalid Category id format"),
        body('name').custom((val,{req})=>{

        req.body.slug = slugify(val);
        return true;
    }),
    ValidatorMaddileware,
    
]

exports.updateSubCategoryValidator=[
       check('id').notEmpty().isMongoId().withMessage('Invalid  Subcategory ID Format'),
        body('name').custom((val,{req})=>{
              
                      req.body.slug = slugify(val);
                      return true;
                  }),
    ValidatorMaddileware,

]

exports.deleteSubCategoryValidator=[
    check('id').notEmpty().isMongoId().withMessage('Invalid  Subcategory ID Format'),
    ValidatorMaddileware,

]