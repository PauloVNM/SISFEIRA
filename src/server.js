// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');
const asyncHandler = require('./middlewares/async.middleware');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/api/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ status: 'UP', database: 'connected' });
}));

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});