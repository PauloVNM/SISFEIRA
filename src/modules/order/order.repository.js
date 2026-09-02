// src/modules/order/order.repository.js
const pool = require('../../config/db');

class OrderRepository {
  async listarPontosRetirada() {
    const query = `SELECT id, nome, endereco FROM pontos_retirada ORDER BY nome ASC`;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = new OrderRepository();