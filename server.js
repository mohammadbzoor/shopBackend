/* eslint-disable import/no-extraneous-dependencies */
const path=require('path')
const morgan = require('morgan');
const express = require('express');
const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors=require('cors');

const compression= require('compression')

dotenv.config({path:'./config.env'});
const ApiError = require('./utils/apiError');
const globalError= require('./middlewares/errorMiddleware');
const { dbConnection } = require('./config/database');
// //Route
const mountAllRoutes = require('./routes');
const {webhookCheckout}=require('./services/orderServices')

// Connect to database
dbConnection();

// Initialize Express app
const app = express();

// Enalble other domainn to access your application 
app.use(cors())
app.options(/.*/g, cors())

// compress all responses
app.use(compression())


//Checkout webhoock

app.post('/wechook-checkout',express.raw({type:'application/json'}),webhookCheckout)

// Middleware
app.use(express.json()); // Parse JSON request bodies

app.use(express.static(path.join(__dirname,'uploads')))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`Mode: ${process.env.NODE_ENV}`);
}


// Mount Routes
mountAllRoutes(app);


app.use((req, res, next) => {
    next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

// Global Error Handling Middleware
app.use(globalError);

const port = process.env.PORT ||8000;
const server=app.listen(port,()=>{
    console.log(`App is running on port ${port}`);
})
// Events => List => callBack(err)
// Handling rejections outside express 
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error(`Server closed due to unhandled rejection shutdown`);
        process.exit(1); // Exit the process with failure
    });
});