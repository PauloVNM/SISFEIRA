// src/modules/order/order.controller.js
const orderService = require('./order.service');
const asyncHandler = require('../../middlewares/async.middleware');

class OrderController {
  listarPontosRetirada = asyncHandler(async (req, res) => {
    const pontos = await orderService.listarPontosRetirada();
    res.status(200).json(pontos);
  });

  fecharPedido = asyncHandler(async (req, res) => {
    const clienteId = req.user.id;
    const pedido = await orderService.fecharPedido(clienteId, req.body);
    res.status(201).json(pedido);
  });

  obterComprovante = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const perfil = req.user.perfil;
    const comprovante = await orderService.obterComprovante(id, usuarioId, perfil);
    res.status(200).json(comprovante);
  });
}

module.exports = new OrderController();