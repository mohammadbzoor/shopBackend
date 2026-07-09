const mongoose = require('mongoose');

//1- Create Schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'Brand name is required'],
        unique: [true, 'Brand name must be unique'],
        minlength: [3, 'Brand name must be at least 3 characters long'],
        maxlength: [32, 'Brand name must be at most 50 characters long'],
    },
    // A and B => shoping.com/a-and-b 
    slug:{
        type: String,
        lowercase: true,
    },
    image: String,

}
,{timestamps:true}
);

const setImageURL=(doc)=>{
        if(doc.image){
        const imageUrl=`${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image=imageUrl;
    }
}
//findOne, findAll and update
brandSchema.post('init',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);

})
//create
brandSchema.post('save',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);


})

//2- Create Model
module.exports = mongoose.model('Brand', brandSchema);


