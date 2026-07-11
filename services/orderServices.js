const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModle');

// App-wide default pricing settings (could later come from a settings collection)
const TAX_PRICE = 0;
const SHIPPING_PRICE = 0;

// -----------------------------------------------------------------------
// Helper: build the bulkWrite ops that decrement stock / increment sold
// -----------------------------------------------------------------------
const buildStockUpdateOps = (cartItems) =>
  cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: { quantity: -item.quantity, sold: +item.quantity },
      },
    },
  }));

// Helper: get the cart total, applying discount if present
const getCartPrice = (cart) =>
  cart.totalPriceAfterDiscount || cart.totalCartPrice;

// -----------------------------------------------------------------------
// @desc    Create cash order
// @route   POST /api/v1/orders/:cartId
// @access  Protected/User
// -----------------------------------------------------------------------
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // 1) Get cart depending on cartId
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  // Make sure the cart belongs to the requesting user
  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError('You are not allowed to access this cart', 403));
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  // 2) Get order price depending on cart (check if coupon applied)
  const cartPrice = getCartPrice(cart);
  const totalOrderPrice = cartPrice + TAX_PRICE + SHIPPING_PRICE;

  // 3) Create order with default paymentMethodType "cash"
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) Decrement product quantity / increment product sold
  const bulkOption = buildStockUpdateOps(cart.cartItems);
  await ProductModel.bulkWrite(bulkOption);

  // 5) Clear cart
  await CartModel.findByIdAndDelete(req.params.cartId);

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

// -----------------------------------------------------------------------
// Middleware: restrict listing to the logged-in user's own orders
// -----------------------------------------------------------------------
exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(OrderModel);

// @desc    Get specific order
// @route   GET /api/v1/orders/:id
// @access  Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(OrderModel);

// -----------------------------------------------------------------------
// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
// -----------------------------------------------------------------------
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with id: ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

// -----------------------------------------------------------------------
// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
// -----------------------------------------------------------------------
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with id: ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

// -----------------------------------------------------------------------
// @desc    Get Stripe checkout session and send it as a response
// @route   GET /api/v1/orders/checkout-session/:cartId
// @access  Protected/User
// -----------------------------------------------------------------------
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // 1) Get cart by cartId
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
    );
  }

  if (cart.user.toString() !== req.user._id.toString()) {
    return next(new ApiError('You are not allowed to access this cart', 403));
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  // 2) Calculate order price
  const cartPrice = getCartPrice(cart);
  const totalOrderPrice = cartPrice + TAX_PRICE + SHIPPING_PRICE;

  const shippingAddress = req.body.shippingAddress || {};

  // 3) Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Order for ${req.user.name}`,
          },
          unit_amount: Math.round(totalOrderPrice * 100), // amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: {
      details: shippingAddress.details || '',
      phone: shippingAddress.phone || '',
      city: shippingAddress.city || '',
      postalCode: shippingAddress.postalCode || '',
    },
  });

  // 4) Send session to response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// -----------------------------------------------------------------------
// Helper used only by the webhook: create the order after a successful
// Stripe card payment
// -----------------------------------------------------------------------
const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  // amount_total is the modern, supported field (display_items is deprecated)
  const orderPrice = session.amount_total / 100;

  const cart = await CartModel.findById(cartId);
  if (!cart) {
    console.error(`Webhook: cart ${cartId} not found`);
    return;
  }

  const user = await UserModel.findOne({ email: session.customer_email });
  if (!user) {
    console.error(`Webhook: user with email ${session.customer_email} not found`);
    return;
  }

  // Create order with paymentMethodType "card"
  const order = await OrderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  if (order) {
    const bulkOption = buildStockUpdateOps(cart.cartItems);
    await ProductModel.bulkWrite(bulkOption);
    await CartModel.findByIdAndDelete(cartId);
  }
};

// -----------------------------------------------------------------------
// @desc    Stripe webhook - handles checkout.session.completed
// @route   POST /webhook-checkout
// @access  Public (verified via Stripe signature)
//
// NOTE: this route must be mounted BEFORE any body-parsing middleware
// (e.g. express.json()) and instead use express.raw({type: 'application/json'})
// so that `req.body` is the raw buffer Stripe's signature check needs.
// -----------------------------------------------------------------------
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await createCardOrder(event.data.object);
    } catch (err) {
      console.error('Error creating card order from webhook:', err);
      // Still acknowledge receipt to Stripe to avoid endless retries,
      // but log for manual follow-up.
    }
  }

  res.status(200).json({ received: true });
});