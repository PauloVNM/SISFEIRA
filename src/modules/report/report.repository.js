// src/modules/report/report.repository.js
const pool = require('../../config/db');

class ReportRepository {
  async obterMetricasGerais(produtorId) {
    const query = `
      SELECT 
        COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0)::numeric(10,2) AS total_faturado,
        COUNT(DISTINCT ip.pedido_id)::int AS total_pedidos
      FROM itens_pedido ip
      JOIN produtos p ON ip.produto_id = p.id
      WHERE p.produtor_id = $1;
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows[0];
  }

  async obterItensMaisVendidos(produtorId) {
    const query = `
      SELECT 
        p.nome AS produto_nome,
        SUM(ip.quantidade)::int AS quantidade_vendida,
        SUM(ip.quantidade * ip.preco_unitario)::numeric(10,2) AS subtotal
      FROM itens_pedido ip
      JOIN produtos p ON ip.produto_id = p.id
      WHERE p.produtor_id = $1
      GROUP BY p.nome
      ORDER BY quantidade_vendida DESC;
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows;
  }
}

module.exports = new ReportRepository();