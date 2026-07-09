const mongoos=require('mongoose');

const productSchema=new mongoos.Schema({
title:{
    type:String,
    required:true,
    trim:true,
    minlength:[3,'Too short product title'],
    maxlength:[100,'Too long product title'],
},
slug:{
    type:String,
    required:true,
    lowercase:true,
},
description:{
    type:String,
    required:[true,'Product description is required'],
    minlength:[20,'Too short product description'],
},
quantity:{
    type:Number,
    required:true,
},
sold:{
    type:Number,
    default:0,
},
price:{
    type:Number,
    required:[true,'product price is required'],
    trim:true,
    max:[20000,'Too long product price']
},
priceAfterDiscount:{
    type:Number,
},
colors:[String],
imageCover:{

    type:String,
    required:[true,'Product Image cover is required']
},
images:[String],
category:{
    type:mongoos.Schema.ObjectId,
    ref:'Category',
    required:[true,'Product must be belong to category ']
},
subcategories:[{
    type:mongoos.Schema.ObjectId,
    ref:'SubCategory',
}],
brand:{
    type:mongoos.Schema.ObjectId,
    ref:'Brand',
},
ratingsAverage:{
    type:Number,
    min:[1,'Rating must be above or equal 1.0 '],
    max:[5,'Rating must be below or equal 5.0']
},
ratingsQuantity:{
    type:Number,
    default:0,
},

},{timestamps:true,
    // to enable virtual populate to show reviews in product route
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});


productSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'product',
    localField:'_id',
})

// Mongoose query Middleware
productSchema.pre(/^find/, function() {
    this.populate({
        path: 'category',
        select: 'name -_id',
    });
});

const setImageURL=(doc)=>{
        if(doc.imageCover){
        const imageUrl=`${process.env.BASE_URL}/products/${doc.imageCover}`;
        doc.imageCover=imageUrl;
    }
       if(doc.images){
        const imagesList=[]
        doc.images.forEach(image => {
           const imageUrl=`${process.env.BASE_URL}/products/${image}`;
           imagesList.push(imageUrl)         
            
        });
        doc.images=imagesList;
       }
}
//findOne, findAll and update
productSchema.post('init',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);

})
//create
productSchema.post('save',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);


})

module.exports=mongoos.model('Product',productSchema);