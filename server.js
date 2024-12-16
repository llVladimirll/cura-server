const express = require('express');
const morgan = require('morgan');
const { config } = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./router/userRoutes');
const problemRoutes = require('./router/problemRoutes');

config();
const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/problems', problemRoutes );

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
