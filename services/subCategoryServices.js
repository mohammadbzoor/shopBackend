const subCategoryModel = require('../models/subCategoryModel');
const factory= require('./handlersFactory')

exports.setCategoryIdToBody=(req,res,next)=>{
    //Nested Route
    if(!req.body.category)req.body.category=req.params.categoryId;
    next();
}
// Nested Route
// GET /api/categories/:categoryId/subcategories
exports.createFilterObj=(req,res,next)=>{
    let filterObject={};

    if(req.params.categoryId)filterObject={category:req.params.categoryId};
    req.filterObj=filterObject;
    
    next();
}

// @desc Create a new subCategory
// @route POST /api/v1/subcategories
// @access Private
exports.createSubCategory = factory.createOne(subCategoryModel);
// Nested Route
// GET /api/categories/:categoryId/subcategories

// @desc Get List of subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getSubCategories = factory.getAll(subCategoryModel)

// @ desc Get Spesific Sabcegory by id
// @route GET /api/v1/subcategories/:id
// @access Public 
exports.getSubCategoryById= factory.getOne(subCategoryModel);


// @desc Update a subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private

exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @desc Delete a category
// @route DELETE /api/v1/categories/:id
// @access Private

exports.deleteSubCategory = factory.deleteOne(subCategoryModel);

