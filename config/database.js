const mongoose = require('mongoose');

const dbConnection = () => {
    // Connect to database
    mongoose.connect(process.env.DB_URI)
        .then((conn) => {
            console.log(`Database connected ${conn.connection.host}`);
        })
        // .catch((err) => {
        //     console.error('Database connection error:', err);
        //     process.exit(1); // Exit the process with failure
        // });
};

module.exports = { dbConnection };