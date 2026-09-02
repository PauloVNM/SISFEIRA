// src/modules/order/order.routes.js
const express = require('express');
const orderController = require('./order.controller');

const router = express.Router();

router.get('/pontos-retirada', orderController.listarPontosRetirada);

module.exports = router;