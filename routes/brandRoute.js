const express = require('express');
const {
    getBrandValidator,
    createBrandValidator,
    updateBrandValidator,
    deleteBrandValidator
}= require('../utils/validators/BrandValidator')
const {
    getBrands,
    createBrand,
    getBrandById,
    updateBrand,
    deleteBrand,
    uploadBrandImage,
    resizeImage
} = require('../services/brandServices');

const authService= require("../services/authService")

const router = express.Router();


router.route('/')

.get(getBrands)
.post(authService.protect,authService.allowedTo('admin','manager'),uploadBrandImage,resizeImage,createBrandValidator, createBrand);


router.route('/:id')

.get(getBrandValidator, getBrandById)
.put(authService.protect,authService.allowedTo('admin','manager'),uploadBrandImage,resizeImage,updateBrandValidator, updateBrand)
.delete(authService.protect,authService.allowedTo('admin'),deleteBrandValidator, deleteBrand);


module.exports = router;

