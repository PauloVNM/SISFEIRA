// src/modules/report/report.routes.js
const express = require('express');
const reportController = require('./report.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/vendas/produtor', verifyToken, requireRole(['PRODUTOR']), reportController.obterRelatorioVendas);

module.exports = router;