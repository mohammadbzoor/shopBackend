const express = require('express');
const {
    getUserValidator,
    createUserValidator,
    updateUserValidator,
    deleteUserValidator,
    changeUserPasswordValidator,
    updateLoggedUserValidator
}= require('../utils/validators/userValidator')
const {
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    changeUserPassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUserData
} = require('../services/userServices');

const authService= require("../services/authService")

const router = express.Router();
router.use(authService.protect)
router.get('/getMe',getLoggedUserData,getUserById)
router.put('/changeMyPassword',updateLoggedUserPassword)
router.put('/updateMe',updateLoggedUserValidator,updateLoggedUserData)
router.delete('/deleteMe',deleteLoggedUserData)




// Admin
router.put(
    '/changePassword/:id',
    changeUserPasswordValidator,
    changeUserPassword
);

router.route('/')
.get(authService.protect,authService.allowedTo('admin','manager'),getUsers)
.post(authService.protect,authService.allowedTo('admin'),uploadUserImage,resizeImage,createUserValidator, createUser);

router.use(authService.protect,authService.allowedTo('admin'))
router.route('/:id')
.get(getUserValidator,getUserById)
.put(uploadUserImage,resizeImage,updateUserValidator,updateUser)
.delete(deleteUserValidator,deleteUser);


module.exports = router;

