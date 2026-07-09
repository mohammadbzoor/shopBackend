//Route
const categoryRoutes = require('./categoryRoute');
const subCategoryRoutes = require('./subCategoryRoute');
const brandRoutes=require('./brandRoute')
const productRoute=require('./productRoute')

const userRoute=require('./userRoute')
const authRoute=require('./authRoute')
const reviewRoute=require('./reviewRoute')

const wishlistRoute=require('./wishlistRoute')
const addressRoute=require('./addressRoute')
const couponRoute=require('./couponRoute')
const cartRoute=require('./cartRoute')
const orderRoute=require('./orderRoute');

const mountRoutes=(app)=>{
// Mount Routes

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/subcategories', subCategoryRoutes);
app.use('/api/v1/brands',brandRoutes)
app.use('/api/v1/products',productRoute)
app.use('/api/v1/users',userRoute)
app.use('/api/v1/auth',authRoute)
app.use('/api/v1/reviews',reviewRoute)
app.use('/api/v1/wishlist',wishlistRoute)
app.use('/api/v1/addresses',addressRoute)
app.use('/api/v1/coupons',couponRoute)
app.use('/api/v1/carts',cartRoute)
app.use('/api/v1/orders',orderRoute)


}

module.exports=mountRoutes;