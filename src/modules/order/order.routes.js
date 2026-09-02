// src/modules/order/order.routes.js
const express = require('express');
const orderController = require('./order.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/pontos-retirada', orderController.listarPontosRetirada);
router.post('/pedidos', verifyToken, requireRole(['CLIENTE']), orderController.fecharPedido);
router.get('/pedidos/historico', verifyToken, requireRole(['CLIENTE']), orderController.listarHistorico);
router.get('/pedidos/produtor', verifyToken, requireRole(['PRODUTOR']), orderController.listarPedidosProdutor);
router.get('/pedidos/:id/comprovante', verifyToken, orderController.obterComprovante);
router.patch('/pedidos/:id/status', verifyToken, requireRole(['PRODUTOR']), orderController.atualizarStatus);

module.exports = router;