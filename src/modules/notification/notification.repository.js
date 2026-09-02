// src/modules/notification/notification.repository.js
const pool = require('../../config/db');

class NotificationRepository {
  async listarPorProdutor(produtorId) {
    const query = `
      SELECT n.id, n.pedido_id, n.mensagem, n.lida,
             p.comprovante_codigo, p.criado_em AS data_pedido
      FROM notificacoes n
      JOIN pedidos p ON n.pedido_id = p.id
      WHERE n.produtor_id = $1
      ORDER BY n.lida ASC, p.criado_em DESC;
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows;
  }

  async marcarComoLida(notificacaoId, produtorId) {
    const query = `
      UPDATE notificacoes 
      SET lida = TRUE 
      WHERE id = $1 AND produtor_id = $2 
      RETURNING id, lida;
    `;
    const result = await pool.query(query, [notificacaoId, produtorId]);
    return result.rows[0];
  }
}

module.exports = new NotificationRepository();