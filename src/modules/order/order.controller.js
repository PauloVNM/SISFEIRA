// src/modules/order/order.controller.js
const orderService = require('./order.service');
const asyncHandler = require('../../middlewares/async.middleware');

class OrderController {
  listarPontosRetirada = asyncHandler(async (req, res) => {
    const pontos = await orderService.listarPontosRetirada();
    res.status(200).json(pontos);
  });
}

module.exports = new OrderController();