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
    findSpecifcOrder,
    updateOrderDeli,
    updateOrderToPaid,
    checkoutSession,
    webhookCheckout

} = require('../services/orderServices');

const authService= require("../services/authService")

const router = express.Router();

// Webhook route (no auth needed, must be before protect middleware)
router.post('/webhook-checkout', express.raw({type: 'application/json'}), webhookCheckout);

router.use(authService.protect)

router.route('/checkout-session/:cartId').get(authService.allowedTo('user'),checkoutSession)

router.route('/').get(authService.allowedTo('user','admin','manager'),filterOrderForLoggedUser,findAllOrders)
router.route('/:cartId')
.post(authService.allowedTo('user'),createCashOrder)

router.route('/:id').get(authService.allowedTo('user'),findSpecifcOrder)

router.route('/:id/pay').put(authService.allowedTo('admin','manager'),updateOrderToPaid)
router.route('/:id/deliver').put(authService.allowedTo('admin','manager'),updateOrderDeli)





module.exports = router;
