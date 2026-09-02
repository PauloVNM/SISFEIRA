// src/modules/order/order.repository.js
const pool = require('../../config/db');

class OrderRepository {
  async listarPontosRetirada() {
    const query = `SELECT id, nome, endereco FROM pontos_retirada ORDER BY nome ASC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async buscarEdicaoAtiva() {
    const query = `SELECT id, nome_identificador FROM edicoes_feira WHERE ativa = TRUE LIMIT 1`;
    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  async buscarPontoRetiradaPorId(id) {
    const query = `SELECT id, nome, endereco FROM pontos_retirada WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async buscarProdutosPorIds(ids) {
    const query = `
      SELECT id, produtor_id, nome, preco, ativo 
      FROM produtos 
      WHERE id = ANY($1::uuid[]) AND ativo = TRUE
    `;
    const result = await pool.query(query, [ids]);
    return result.rows;
  }

  async criarPedidoTransacional({ cliente_id, edicao_id, ponto_retirada_id, comprovante_codigo, status, valor_total, itens, notificacoes }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertPedidoQuery = `
        INSERT INTO pedidos (cliente_id, edicao_id, ponto_retirada_id, comprovante_codigo, status, valor_total)
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, comprovante_codigo, status, valor_total, criado_em;
      `;
      const pedidoRes = await client.query(insertPedidoQuery, [
        cliente_id, edicao_id, ponto_retirada_id, comprovante_codigo, status, valor_total
      ]);
      const pedido = pedidoRes.rows[0];

      const insertItemQuery = `
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4);
      `;
      for (const item of itens) {
        await client.query(insertItemQuery, [
          pedido.id, item.produto_id, item.quantidade, item.preco_unitario
        ]);
      }

      const insertNotificacaoQuery = `
        INSERT INTO notificacoes (produtor_id, pedido_id, mensagem)
        VALUES ($1, $2, $3);
      `;
      for (const notif of notificacoes) {
        await client.query(insertNotificacaoQuery, [
          notif.produtor_id, pedido.id, notif.mensagem
        ]);
      }

      await client.query('COMMIT');
      return pedido;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarComprovantePorId(pedidoId, usuarioId, perfil) {
    const pedidoQuery = `
      SELECT p.id, p.comprovante_codigo, p.status, p.valor_total, p.criado_em, p.cliente_id,
             pr.nome AS ponto_nome, pr.endereco AS ponto_endereco,
             ef.nome_identificador AS edicao_nome,
             u_cli.nome AS cliente_nome, u_cli.telefone AS cliente_telefone
      FROM pedidos p
      JOIN pontos_retirada pr ON p.ponto_retirada_id = pr.id
      JOIN edicoes_feira ef ON p.edicao_id = ef.id
      JOIN usuarios u_cli ON p.cliente_id = u_cli.id
      WHERE p.id = $1;
    `;
    const pedidoRes = await pool.query(pedidoQuery, [pedidoId]);
    const pedido = pedidoRes.rows[0];

    if (!pedido) return null;

    if (perfil === 'CLIENTE' && pedido.cliente_id !== usuarioId) {
      const error = new Error('Acesso não autorizado ao pedido');
      error.statusCode = 403;
      error.codigo = 'FORBIDDEN';
      throw error;
    }

    const itensQuery = `
      SELECT ip.quantidade, ip.preco_unitario, prod.nome AS produto_nome,
             u_prod.id AS produtor_id, u_prod.nome AS produtor_nome, u_prod.telefone AS produtor_telefone
      FROM itens_pedido ip
      JOIN produtos prod ON ip.produto_id = prod.id
      JOIN usuarios u_prod ON prod.produtor_id = u_prod.id
      WHERE ip.pedido_id = $1;
    `;
    const itensRes = await pool.query(itensQuery, [pedidoId]);
    pedido.itens = itensRes.rows;

    return pedido;
  }
}

module.exports = new OrderRepository();