// src/modules/order/order.service.js
const orderRepository = require('./order.repository');

class OrderService {
  async listarPontosRetirada() {
    return await orderRepository.listarPontosRetirada();
  }
}

module.exports = new OrderService();