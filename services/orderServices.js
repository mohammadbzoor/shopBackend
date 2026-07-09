// eslint-disable-next-line import/no-extraneous-dependencies
const stripe=require('stripe')(process.env.STRIPE_SECRET)

const asyncHandler=require('express-async-handler')
const factory= require('./handlersFactory')
const ApiError = require('../utils/apiError');
const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const { strip } = require('colors');
// @desc create cash order 
// route POST /api/v1/orders/cartId
// Protected/User

exports.createCashOrder=asyncHandler(async (req,res,next)=>{
    //app settings
    const taxPrice=0;
    const shippingPrice=0;
    //1) Get cart depend on cartId
    const cart=await CartModel.findById(req.params.cartId)
    if(!cart){
        return next(new ApiError(`There is no cart with id ${req.params.cartId}`,404))
    }
    //2) Get order price depend on cart "Check if coupon apply"
// sourcery skip: simplify-ternary
    const cartPrice = cart.totalPriceAfterDiscount 
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice

    const totalOrderPrice= cartPrice +taxPrice + shippingPrice;
    //3) Create Order with default paymentMethodType cash

    const order =await OrderModel.create({
        user:req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,

    })
    //4) After creating order, decrement product quantity, increment product sold 
    if(order){
        const bulkOption = cart.cartItems.map((item)=>({
            updateOne:{
                filter:{_id: item.product},
                update:{
                $inc:{
                    quantity: -item.quantity,
                    sold: +item.quantity
                },
            }
    
            },
        }))
        await productModel.bulkWrite(bulkOption,{})

        //5) Clear cart depend on cartId
        await cartModel.findByIdAndDelete(req.params.cartId)
    }
    res.status(201).json({
        status:'success',
        data:order
    })
})

exports.filterOrderForLoggedUser=asyncHandler(async (req,res,next)=>{
    if(req.user.role==="user") req.filterObj = {user:req.user._id}

    next()
})
// @desc Get all orders
// route POST /api/v1/orders
// Protected/User-Admin-Manager
exports.findAllOrders=factory.getAll(OrderModel)

// @desc Get specifc orders
// route POST /api/v1/orders
// Protected/User-Admin-Manager
exports.findSpecifcOrder=factory.getOne(OrderModel)

// @desc Update order paid status to paid
// route PUT /api/v1/orders/:id/pay
// Protected/User-Admin-Manager
exports.updateOrderToPaid=asyncHandler(async(req,res,next)=>{
    const order=await OrderModel.findById(req.params.id)
    if(!order){
        return next(new ApiError(`There is no such a order with the id:  ${req.params.id}`,404))
    }
    // updeate order to paid 
    order.isPaid=true;
    order.paidAt=Date.now();

    const updateOrder= await order.save();

    res.status(200).json({
        status:"success",
        data:updateOrder
    })
})

// @desc Update order deliver status
// route PUT /api/v1/orders/:id/deliver
// Protected/User-Admin-Manager
exports.updateOrderDeli=asyncHandler(async(req,res,next)=>{
    const order=await OrderModel.findById(req.params.id)
    if(!order){
        return next(new ApiError(`There is no such a order with the id:  ${req.params.id}`,404))
    }
    // updeate order to paid 
    order.isDelivered=true;
    order.deliveredAt=Date.now();

    const updateOrder= await order.save();

    res.status(200).json({
        status:"success",
        data:updateOrder
    })
})

// @desc Get checkout session from stripe and send it as response
// route GET /api/v1/orders/checkout-session/cartId
// Protected/User

// exports.checkoutSession=asyncHandler(async(req,res,next)=>{
//         //app settings
//     const taxPrice=0;
//     const shippingPrice=0;
//     //1) Get cart depend on cartId
//     const cart=await CartModel.findById(req.params.cartId)
//     if(!cart){
//         return next(new ApiError(`There is no cart with id ${req.params.cartId}`,404))
//     }
//     //2) Get order price depend on cart "Check if coupon apply"
// // sourcery skip: simplify-ternary
//     const cartPrice = cart.totalPriceAfterDiscount 
//     ? cart.totalPriceAfterDiscount
//     : cart.totalCartPrice

//     const totalOrderPrice=cartPrice + taxPrice + shippingPrice;

//     //3) Create stripe checkout session 
//     const session =await stripe.checkout.sessions.create({
//         line_items:[
//             {name:req.user.name,
//              amount:totalOrderPrice * 100,
//              currency:'egp',
             
//             },
//         ],
//         mode:'payment',
//         success_url:`${req.protocol}://${req.get('host')}/orders`,
//         cancel_url:`${req.protocol}://${req.get('host')}/cart`,
//         customer_email:req.user.email,
//         client_reference_id:req.params.cartId,
//         // metadata:req.body.shippingAddress,


//     });
//     //4) send session to response
//     res.status(200).json({
//         status:'success',
//         session
//     })

// })
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart by cartId
  const cart = await CartModel.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Calculate order price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Order for ${req.user.name}`,
          },
          unit_amount: Math.round(totalOrderPrice * 100), // cents
        },
        quantity: 1,
      },
    ],

    mode: 'payment',


success_url: `${req.protocol}://${req.get('host')}/api/v1/orders`,
cancel_url: `${req.protocol}://${req.get('host')}/api/v1/cart`,


    customer_email: req.user.email,

    client_reference_id: req.params.cartId,


    metadata: {
      details:
        req.body &&
        req.body.shippingAddress &&
        req.body.shippingAddress.details
          ? req.body.shippingAddress.details
          : '',
      phone:
        req.body &&
        req.body.shippingAddress &&
        req.body.shippingAddress.phone
          ? req.body.shippingAddress.phone
          : '',
      city:
        req.body &&
        req.body.shippingAddress &&
        req.body.shippingAddress.city
          ? req.body.shippingAddress.city
          : '',
      postalcode:
        req.body &&
        req.body.shippingAddress &&
        req.body.shippingAddress.postalcode
          ? req.body.shippingAddress.postalcode
          : '',
    },
  });

  // 4) Send session to response
  res.status(200).json({
    status: 'success',
    session,
  });
});


exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  console.log('WEBHOOK ARRIVED');

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log('Create Order Here............');

    const session = event.data.object;

    console.log('Session ID:', session.id);
    console.log('Cart ID:', session.client_reference_id);
    console.log('Customer Email:', session.customer_email);
  }

  res.status(200).json({ received: true });
});