const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Subcategory must be Unique"],
      minlength: [2, "to short SubCategory name"],
      maxlength: [32, "to long SubCategory name"],
    },
    slug:{
    type:String,
    lowercase:true
  },
  category:{
    type:mongoose.Schema.ObjectId,
    ref:'Category',
    required:[true,"SubCategory must be belong tp parent category"]
  }
  },

  {timestamps: true});

module.exports=mongoose.model("SubCategory",subCategorySchema);