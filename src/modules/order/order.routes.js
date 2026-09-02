// src/modules/order/order.routes.js
const express = require('express');
const orderController = require('./order.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/pontos-retirada', orderController.listarPontosRetirada);
router.post('/pedidos', verifyToken, requireRole(['CLIENTE']), orderController.fecharPedido);
router.get('/pedidos/:id/comprovante', verifyToken, orderController.obterComprovante);

module.exports = router;