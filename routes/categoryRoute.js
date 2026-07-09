const express = require('express');
const {getCategoryValidator,createCategoryValidator,updateCategoryValidator,deleteCategoryValidator}= require('../utils/validators/categoryValidator')
const {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    resizeImage
} = require('../services/categoryServices');

const authService= require("../services/authService")


const subcategoriesRoute=require('./subCategoryRoute')

const router = express.Router();

router.use('/:categoryId/subcategories',subcategoriesRoute)

router.route('/')

.get(getCategories)
.post(
    authService.protect,
    authService.allowedTo('admin','manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
    );

    
router.route('/:id')

.get(getCategoryValidator, getCategoryById)

.put(  
    authService.protect,
    authService.allowedTo('admin','manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
    )
.delete(
    authService.protect,
    authService.allowedTo('admin'),    
    deleteCategoryValidator,
    deleteCategory);


module.exports = router;

