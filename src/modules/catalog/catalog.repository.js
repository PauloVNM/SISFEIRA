// src/modules/catalog/catalog.repository.js
const pool = require('../../config/db');

class CatalogRepository {
  async listarCatalogoPublico() {
    const query = `
      SELECT p.id, p.nome, p.descricao, p.preco, p.unidade_medida, 
             u.nome AS produtor_nome, u.id AS produtor_id
      FROM produtos p
      INNER JOIN usuarios u ON p.produtor_id = u.id
      WHERE p.ativo = TRUE
      ORDER BY p.nome ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async listarPorProdutor(produtorId) {
    const query = `
      SELECT id, nome, descricao, preco, unidade_medida, ativo 
      FROM produtos 
      WHERE produtor_id = $1 AND ativo = TRUE 
      ORDER BY nome ASC
    `;
    const result = await pool.query(query, [produtorId]);
    return result.rows;
  }

  async buscarPorId(id) {
    const query = `SELECT * FROM produtos WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async criarProduto({ produtor_id, nome, descricao, preco, unidade_medida }) {
    const query = `
      INSERT INTO produtos (produtor_id, nome, descricao, preco, unidade_medida) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [produtor_id, nome, descricao, preco, unidade_medida];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async atualizarProduto(id, produtorId, { nome, descricao, preco, unidade_medida }) {
    const query = `
      UPDATE produtos 
      SET nome = $1, descricao = $2, preco = $3, unidade_medida = $4 
      WHERE id = $5 AND produtor_id = $6 
      RETURNING *
    `;
    const values = [nome, descricao, preco, unidade_medida, id, produtorId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async desativarProduto(id, produtorId) {
    const query = `
      UPDATE produtos 
      SET ativo = FALSE 
      WHERE id = $1 AND produtor_id = $2 
      RETURNING id
    `;
    const result = await pool.query(query, [id, produtorId]);
    return result.rows[0];
  }
}

module.exports = new CatalogRepository();