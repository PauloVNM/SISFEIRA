// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const asyncHandler = require('../../middlewares/async.middleware');

class AuthController {
  cadastrar = asyncHandler(async (req, res) => {
    const novoUsuario = await authService.cadastrar(req.body);
    res.status(201).json(novoUsuario);
  });

  login = asyncHandler(async (req, res) => {
    const credenciais = await authService.login(req.body);
    res.status(200).json(credenciais);
  });
}

module.exports = new AuthController();