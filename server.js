const express = require('express');
const morgan = require('morgan');
const { config } = require('dotenv');

config();

const app = express();

// Middleware
app.use(morgan('dev'));

// Routes

// Listen to port
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});