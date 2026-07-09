const express = require('express');

const {
    createSubCategory,
    getSubCategories,
    getSubCategoryById,
    deleteSubCategory,
    updateSubCategory,
    setCategoryIdToBody,
    createFilterObj,
} = require('../services/subCategoryServices');

const {
    createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator,

}=require("../utils/validators/subCategoryValidator")

const authService= require("../services/authService")

// mergeParams : allow us to access parameters on other routers
// ex : We need to access categoryId form category route
const router = express.Router({mergeParams:true});




router.route('/')
.post(authService.protect,authService.allowedTo('admin','manager'),setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
.get(createFilterObj, getSubCategories);

router.route('/:id')
.get(getSubCategoryValidator, getSubCategoryById)
.put(authService.protect,authService.allowedTo('admin','manager'),updateSubCategoryValidator, updateSubCategory)
.delete(authService.protect,authService.allowedTo('admin'),deleteSubCategoryValidator, deleteSubCategory)
;


module.exports=router;