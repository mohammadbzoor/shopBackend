const express = require('express');
const {
    addAddress,
    removeAddress,
    getLoggedUserAddresses,
} = require('../services/addressService');
const {
    addAddressValidator,
    removeAddressValidator,
} = require('../utils/validators/addressValidator');

const authService= require("../services/authService")

const router = express.Router();


router.use(authService.protect,authService.allowedTo('user'));
router.route('/').post(addAddressValidator, addAddress).get(getLoggedUserAddresses);

router.route('/:addressId').delete(removeAddressValidator, removeAddress);


module.exports = router;

