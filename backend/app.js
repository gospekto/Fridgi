const express = require('express');
const path = require('path');
const productsRoutes = require('./routes/productsRoutes');
// const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productsRoutes);

// Error handling
// app.use(errorHandler);

module.exports = app;