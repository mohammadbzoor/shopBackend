const express = require('express');
const {
    signupValidator,
    loginValidator

}= require('../utils/validators/authValidator')
const {
    signup,
    login,
    forgotPassword,
    verifyPasswordResetCode,
    resetPassword

} = require('../services/authService');


const router = express.Router();


// router.put(
//     '/changePassword/:id',
//     changeUserPasswordValidator,
//     changeUserPassword
// );

router.post('/signup',signupValidator,signup);

router.post('/login',loginValidator,login);


router.post('/forgotPassword',forgotPassword);
router.post('/verifyResetCode',verifyPasswordResetCode);
router.put('/resetPassword',resetPassword);


// router.route('/:id')

// .get(getUserValidator,getUserById)
// .put(uploadUserImage,resizeImage,updateUserValidator,updateUser)
// .delete(deleteUserValidator,deleteUser);


module.exports = router;

