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

  listarHistorico = asyncHandler(async (req, res) => {
    const historico = await orderService.listarHistoricoCliente(req.user.id);
    res.status(200).json(historico);
  });

  listarPedidosProdutor = asyncHandler(async (req, res) => {
    const pedidos = await orderService.listarPedidosProdutor(req.user.id);
    res.status(200).json(pedidos);
  });

  atualizarStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const produtorId = req.user.id;
    const { status } = req.body;
    const resultado = await orderService.atualizarStatusPedido(id, produtorId, status);
    res.status(200).json(resultado);
  });
}

module.exports = new OrderController();