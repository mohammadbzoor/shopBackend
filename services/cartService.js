/* eslint-disable node/no-missing-require */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const asyncHandler=require('express-async-handler')
const ApiError = require('../utils/apiError');
const CartModel=require('../models/cartModel');
const ProductModel=require('../models/productModel');
const coponModel=require('../models/couponModel')

const culcTotalCartPrice=(cart)=>{
    let totalPrice=0;
  cart.cartItems.forEach((item)=>{
    totalPrice += item.price * item.quantity;
    cart.totalPriceAfterDiscount=undefined;
  });
    cart.totalCartPrice=totalPrice;
  return totalPrice;
}

// @desc Add product to cart
// @route POST /api/v1/carts
// @access Private/User
exports.addProductToCart=asyncHandler(async(req,res,next)=>{
  // 1) get Cart for logged user

  const {productId,color}=req.body;
  const product=await ProductModel.findById(productId);

  if(!product){
    return next(new ApiError('Product not found', 404));
  }

  let cart=await CartModel.findOne({user:req.user._id})

  if(!cart){
    // create cart for logged user with product
        cart =await CartModel.create({
            
        user:req.user._id,
        cartItems:[{ product:productId, color: color,price: product.price}]
    })
  }else{
    //product exist in cart => update product quantity
    const productIndex=cart.cartItems.findIndex(
      (item)=> item.product.toString() === productId && item.color === color
    )
    if(productIndex > -1){
      const cartItem=cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex]=cartItem;
    }else{
      //product not exist in cart ,push product in cartItems array
      cart.cartItems.push({product:productId,color:color,price: product.price})
    }
    console.log(productIndex)
  }

  // calculate total cart price
culcTotalCartPrice(cart);

  await cart.save();
  res.status(200).json({
    status:'success',
    message:'Product added to cart successfully',
    data:cart
  })
})

// @desc Get Logged user cart
// @route GET /api/v1/carts
// @access Private/User

exports.getLoggedUserCart=asyncHandler(async(req,res,next)=>{
  const cart=await CartModel.findOne({user:req.user._id});
  if(!cart){
    return next(new ApiError(`There is no cart for this user id ${req.user._id}`, 404));
  }
  res.status(200).json({
    status:'success',
    numberOfCartItems:cart.cartItems.length,
    data:cart
  })
})

// @desc Remove Specific user cart
// @route DELETE  /api/v1/carts
// @access Private/User

exports.removeSpecificUserCart=asyncHandler(async(req,res,next)=>{
  const cart=await CartModel.findOneAndUpdate(
    {user:req.user._id},
    {
      $pull:{cartItems:{_id:req.params.itemId}}
    },
    {new:true}
  );

  culcTotalCartPrice(cart);

  await cart.save();
  res.status(200).json({
    status:'success',
    numberOfCartItems:cart.cartItems.length,
    message:'Product removed from cart successfully',
    data:cart
  })

})

// @desc Clear Logged user cart
// @route DELETE  /api/v1/carts
// @access Private/User

exports.clearCart=asyncHandler(async(req,res,next)=>{
  await CartModel.findOneAndDelete({user:req.user._id});
  res.status(200).json({
    status:'success',
    message:'Cart cleared successfully'
  })
})

// @desc Update Specifidc cart item quntity 
// @route PUT  /api/v1/carts
// @access Private/User

exports.updateCartItemQuantity=asyncHandler(async(req,res,next)=>{
  
  const {quantity}=req.body;
  const cart=await CartModel.findOne({user:req.user._id});
  if(!cart){
    return next(new ApiError(`There is no cart for this user id ${req.user._id}`, 404));
  }
  const itemIndex=cart.cartItems.findIndex(
    (item)=> item._id.toString() === req.params.itemId
  )
  if(itemIndex> -1){
    const cartItem=cart.cartItems[itemIndex];
    cartItem.quantity=quantity;
    cart.cartItems[itemIndex]=cartItem;
    
  }else{
    return next(new ApiError(`There is no item for this id ${req.params.itemId}`, 404));
  }

 culcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status:'success',
    numberOfCartItems:cart.cartItems.length,
    message:'Cart item quantity updated successfully',
    data:cart
  })
})

// @desc Apply coupon on logged user cart
// @route PUT  /api/v1/carts
// @access Private/User
exports.applyCoupon=asyncHandler(async(req,res,next)=>{
  //1) Get coupon based on coupon name
  const coupon=await coponModel.findOne({name:req.body.coupon,expire:{$gt:Date.now()}})
  if(!coupon){
    return next(new ApiError(`Coupon is invalid or expired`, 404));
  }

  // 2) Get Cart for logged user to get total price (cart price)
  const cart=await CartModel.findOne({user:req.user._id});

  const totalPrice=cart.totalCartPrice;

  // 3) Calculate price after discount
  const totalPriceAfterDiscount=(totalPrice-(totalPrice * coupon.discount)/100).toFixed(2);

  cart.totalPriceAfterDiscount=totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status:'success',
    numberOfCartItems:cart.cartItems.length,
    message:'Coupon applied successfully',
    data:cart,
  })
})