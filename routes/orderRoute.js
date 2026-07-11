const express = require('express');
// const {
//     getBrandValidator,
//     createBrandValidator,
//     updateBrandValidator,
//     deleteBrandValidator
// }= require('../utils/validators/BrandValidator')
const {
    createCashOrder,
    filterOrderForLoggedUser,
    findAllOrders,
    findSpecificOrder,
    updateOrderToDelivered,
    updateOrderToPaid,
    checkoutSession

} = require('../services/orderServices');

const authService= require("../services/authService")

const router = express.Router();

router.use(authService.protect)

router.route('/checkout-session/:cartId').get(authService.allowedTo('user'),checkoutSession)

router.route('/').get(authService.allowedTo('user','admin','manager'),filterOrderForLoggedUser,findAllOrders)
router.route('/:cartId')
.post(authService.allowedTo('user'),createCashOrder)

router.route('/:id').get(authService.allowedTo('user'),findSpecificOrder)

router.route('/:id/pay').put(authService.allowedTo('admin','manager'),updateOrderToPaid)
router.route('/:id/deliver').put(authService.allowedTo('admin','manager'),updateOrderToDelivered)





module.exports = router;
