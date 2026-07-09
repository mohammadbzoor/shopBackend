const mongoose = require("mongoose");
const ProductModle = require("./productModel");

const reviewSchema=new mongoose.Schema({

    title:{
        type:String
    },
    ratings:{
        type:Number,
        min:[1,'Min rating value is 1.0'],
        max:[5,'Max rating value is 5.0'],
        required:[true,'review ratings required']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        Required:[true,'Review must belong to user ']

    },
    //parent reference (one to many relationship)
    product:{
        type:mongoose.Schema.ObjectId,
        ref:"Product",
        Required:[true,'Review must belong to Product ']
    }

},{timestamps:true})

reviewSchema.pre(/^find/, function() {
    this.populate({ path: 'user', select: 'name' });
});

// 
reviewSchema.statics.calcAvarageRatingsAndQuantity = async function(productId) {
    const stats = await this.aggregate([
        //Stage 1: get All Review in Spaecific product
        {
            $match: { product: productId }
        },
        // Stage 2: Group them by product and calculate average rating and quantity
        {
            $group: {
                _id: 'product',
                averageRating: { $avg: '$ratings' },
                ratingQuantity: { $sum: 1 }
            }
        }

    ]);
console.log(stats);
if(stats.length>0){
    await ProductModle.findByIdAndUpdate(productId,{
        ratingsAverage:stats[0].averageRating,
        ratingsQuantity:stats[0].ratingQuantity
    })
}else{
        await ProductModle.findByIdAndUpdate(productId,{
        ratingsAverage:0,
        ratingsQuantity:0,
    });
    }

    // return stats[0];
};

reviewSchema.post('save',async function() {
  await this.constructor.calcAvarageRatingsAndQuantity(this.product);
});
reviewSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function() {
    await this.constructor.calcAvarageRatingsAndQuantity(this.product);
  }
);


module.exports = mongoose.model('Review', reviewSchema)