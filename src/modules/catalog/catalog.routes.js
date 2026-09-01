// src/modules/catalog/catalog.routes.js
const express = require('express');
const catalogController = require('./catalog.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/catalogo', catalogController.listarCatalogo);
router.get('/produtos/produtor', verifyToken, requireRole(['PRODUTOR']), catalogController.listarProdutosDoProdutor);
router.post('/produtos', verifyToken, requireRole(['PRODUTOR']), catalogController.criarProduto);
router.put('/produtos/:id', verifyToken, requireRole(['PRODUTOR']), catalogController.atualizarProduto);
router.delete('/produtos/:id', verifyToken, requireRole(['PRODUTOR']), catalogController.desativarProduto);

module.exports = router;