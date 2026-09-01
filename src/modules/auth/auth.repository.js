const pool = require('../../config/db');

class AuthRepository {
  async buscarPorEmail(email) {
    const query = `
      SELECT id, nome, email, senha_hash, telefone, perfil 
      FROM usuarios 
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async criarUsuario({ nome, email, senha_hash, telefone, perfil }) {
    const query = `
      INSERT INTO usuarios (nome, email, senha_hash, telefone, perfil) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, nome, email, telefone, perfil
    `;
    const values = [nome, email, senha_hash, telefone, perfil];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = new AuthRepository();
