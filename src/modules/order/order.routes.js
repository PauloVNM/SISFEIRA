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

// --- NOVAS ROTAS FEAT-03/FEAT-04 ---

// Rota pública para compatibilidade do carrinho
router.post('/pontos-retirada/compatibilidade', orderController.verificarCompatibilidade);

// Rotas exclusivas do produtor para gerenciar pontos de retirada
router.get('/produtor/pontos-retirada', verifyToken, requireRole(['PRODUTOR']), orderController.listarMeusPontos);
router.post('/produtor/pontos-retirada', verifyToken, requireRole(['PRODUTOR']), orderController.criarPonto);
router.put('/produtor/pontos-retirada', verifyToken, requireRole(['PRODUTOR']), orderController.atualizarMeusPontos);

module.exports = router;