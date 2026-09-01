// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      erro: true,
      mensagem: 'Token inválido ou não fornecido',
      codigo: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      erro: true,
      mensagem: 'Token inválido ou não fornecido',
      codigo: 'UNAUTHORIZED'
    });
  }
};

const requireRole = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidas.includes(req.user.perfil)) {
      return res.status(403).json({
        erro: true,
        mensagem: 'Acesso não autorizado para este perfil',
        codigo: 'FORBIDDEN'
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };