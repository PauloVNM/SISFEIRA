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
      SELECT id, produtor_id, nome, preco, unidade_medida, ativo 
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

  async listarPorCliente(clienteId) {
    const query = `
      SELECT p.id, p.comprovante_codigo, p.status, p.valor_total, p.criado_em,
             pr.nome AS ponto_nome, pr.endereco AS ponto_endereco
      FROM pedidos p
      JOIN pontos_retirada pr ON p.ponto_retirada_id = pr.id
      WHERE p.cliente_id = $1
      ORDER BY p.criado_em DESC;
    `;
    const result = await pool.query(query, [clienteId]);
    return result.rows;
  }

  async listarPorProdutor(produtorId) {
    const query = `
      SELECT DISTINCT p.id, p.comprovante_codigo, p.status, p.valor_total, p.criado_em,
             pr.nome AS ponto_nome,
             u_cli.nome AS cliente_nome, u_cli.telefone AS cliente_telefone
      FROM pedidos p
      JOIN pontos_retirada pr ON p.ponto_retirada_id = pr.id
      JOIN usuarios u_cli ON p.cliente_id = u_cli.id
      JOIN itens_pedido ip ON p.id = ip.pedido_id
      JOIN produtos prod ON ip.produto_id = prod.id
      WHERE prod.produtor_id = $1
      ORDER BY p.criado_em DESC;
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows;
  }

  async buscarItensDoProdutorNoPedido(pedidoId, produtorId) {
    const query = `
      SELECT ip.quantidade, ip.preco_unitario, prod.nome AS produto_nome
      FROM itens_pedido ip
      JOIN produtos prod ON ip.produto_id = prod.id
      WHERE ip.pedido_id = $1 AND prod.produtor_id = $2;
    `;
    const result = await pool.query(query, [pedidoId, produtorId]);
    return result.rows;
  }

  async verificarProdutorPertenceAoPedido(pedidoId, produtorId) {
    const query = `
      SELECT 1 FROM itens_pedido ip
      JOIN produtos prod ON ip.produto_id = prod.id
      WHERE ip.pedido_id = $1 AND prod.produtor_id = $2
      LIMIT 1;
    `;
    const result = await pool.query(query, [pedidoId, produtorId]);
    return result.rows.length > 0;
  }

  async buscarStatusAtual(pedidoId) {
    const query = `SELECT id, status, comprovante_codigo FROM pedidos WHERE id = $1;`;
    const result = await pool.query(query, [pedidoId]);
    return result.rows[0];
  }

  async atualizarStatus(pedidoId, novoStatus) {
    const query = `
      UPDATE pedidos 
      SET status = $1 
      WHERE id = $2 
      RETURNING id, status, comprovante_codigo;
    `;
    const result = await pool.query(query, [novoStatus, pedidoId]);
    return result.rows[0];
  }

  async buscarEmailsProdutoresPorIds(produtorIds) {
    const query = `
      SELECT id, nome, email 
      FROM usuarios 
      WHERE id = ANY($1::uuid[]) AND perfil = 'PRODUTOR'
    `;
    const result = await pool.query(query, [produtorIds]);
    return result.rows;
  }

  // --- NOVOS MÉTODOS FEAT-03/FEAT-04 ---

  async cadastrarPontoRetirada({ nome, endereco, criadoPorId }) {
    const query = `
      INSERT INTO pontos_retirada (nome, endereco, criado_por) 
      VALUES ($1, $2, $3) 
      RETURNING id, nome, endereco;
    `;
    const result = await pool.query(query, [nome, endereco, criadoPorId]);
    return result.rows[0];
  }

  async vincularProdutorPonto(produtorId, pontoId, client = null) {
    const query = `
      INSERT INTO produtores_pontos_retirada (produtor_id, ponto_retirada_id) 
      VALUES ($1, $2) 
      ON CONFLICT DO NOTHING;
    `;
    const conn = client || pool;
    await conn.query(query, [produtorId, pontoId]);
  }

  async listarPontosPorProdutor(produtorId) {
    const query = `
      SELECT pr.id, pr.nome, pr.endereco
      FROM pontos_retirada pr
      JOIN produtores_pontos_retirada ppr ON pr.id = ppr.ponto_retirada_id
      WHERE ppr.produtor_id = $1
      ORDER BY pr.nome ASC;
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows;
  }

  async atualizarPontosDoProdutorTransacional(produtorId, pontoIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM produtores_pontos_retirada WHERE produtor_id = $1', [produtorId]);
      
      if (Array.isArray(pontoIds) && pontoIds.length > 0) {
        const insertQuery = `
          INSERT INTO produtores_pontos_retirada (produtor_id, ponto_retirada_id) 
          VALUES ($1, $2);
        `;
        for (const pontoId of pontoIds) {
          await client.query(insertQuery, [produtorId, pontoId]);
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPontosPorProdutoIds(produtoIds) {
    const query = `
      SELECT DISTINCT prod.id AS produto_id, prod.produtor_id, u.nome AS produtor_nome, pr.id AS ponto_id, pr.nome AS ponto_nome, pr.endereco AS ponto_endereco
      FROM produtos prod
      JOIN usuarios u ON prod.produtor_id = u.id
      JOIN produtores_pontos_retirada ppr ON u.id = ppr.produtor_id
      JOIN pontos_retirada pr ON ppr.ponto_retirada_id = pr.id
      WHERE prod.id = ANY($1::uuid[]) AND prod.ativo = TRUE;
    `;
    const result = await pool.query(query, [produtoIds]);
    return result.rows;
  }

  async verificarProdutorAtendePonto(produtorId, pontoRetiradaId) {
    const query = `
      SELECT 1 
      FROM produtores_pontos_retirada 
      WHERE produtor_id = $1 AND ponto_retirada_id = $2;
    `;
    const result = await pool.query(query, [produtorId, pontoRetiradaId]);
    return result.rows.length > 0;
  }
}

module.exports = new OrderRepository();