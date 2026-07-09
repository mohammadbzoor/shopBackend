const mongoose = require('mongoose');

//1- Create Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'Category name is required'],
        unique: [true, 'Category name must be unique'],
        minlength: [3, 'Category name must be at least 3 characters long'],
        maxlength: [50, 'Category name must be at most 50 characters long'],
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
        const imageUrl=`${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image=imageUrl;
    }
}
//findOne, findAll and update
categorySchema.post('init',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);

})
//create
categorySchema.post('save',(doc)=>{
    //set return image base url + image name
    setImageURL(doc);


})

//2- Create Model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

