const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');

class AuthService {
  async cadastrar({ nome, email, senha, telefone, perfil }) {
    if (!nome || !email || !senha || !perfil) {
      const error = new Error('Campos obrigatórios: nome, email, senha e perfil');
      error.statusCode = 400;
      throw error;
    }

    const perfisValidos = ['CLIENTE', 'PRODUTOR', 'ORGANIZACAO'];
    if (!perfisValidos.includes(perfil)) {
      const error = new Error('Perfil inválido');
      error.statusCode = 400;
      throw error;
    }

    if (perfil === 'PRODUTOR' && !telefone) {
      const error = new Error('Telefone é obrigatório para produtores');
      error.statusCode = 400;
      throw error;
    }

    const usuarioExistente = await authRepository.buscarPorEmail(email);
    if (usuarioExistente) {
      const error = new Error('E-mail já cadastrado');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    const novoUsuario = await authRepository.criarUsuario({
      nome,
      email,
      senha_hash,
      telefone: telefone || null,
      perfil
    });

    return novoUsuario;
  }

  async login({ email, senha }) {
    if (!email || !senha) {
      const error = new Error('Email e senha são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await authRepository.buscarPorEmail(email);
    if (!usuario) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(senha, usuario.senha_hash);
    if (!isMatch) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    };

    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'supersecret', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
      token,
      usuario: payload
    };
  }
}

module.exports = new AuthService();
