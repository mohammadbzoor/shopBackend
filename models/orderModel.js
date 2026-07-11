
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:[  true,'Order must belong to a user']
   },
   cartItems:[
    {  product:{
                type:mongoose.Schema.ObjectId,
                ref:'Product'},
            quantity:Number,
            color:String,
            price:Number
    }
   ],
   taxPrice:{
    type:Number,
    default:0
   },
   shippingAddress:{
      details:String,
      phone:String,
      city:String,
      postalCode:String,
   },
   shippingPrice:{
    type:Number,
    default:0
   },
   totalOrderPrice:{
    type:Number,

   },
   pamentMethodType:{
    type:String,
    enum:['card','cash'],
    default:'cash'
   },
   isPaid:{
    type:Boolean,
    default:false,
   },
   paidAt:Date,
   isDelivered:{
    type:Boolean,
    default:false,

   },
   deliveredAt:Date,

},{timestamps:true})

orderSchema.pre(/^find/, async function() {
   this.populate('user', 'name profileImg email phone')
      .populate('cartItems.product', 'title imageCover');
})


module.exports=mongoose.model('Order',orderSchema)