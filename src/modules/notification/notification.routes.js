// src/modules/notification/notification.routes.js
const express = require('express');
const notificationController = require('./notification.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/produtor', verifyToken, requireRole(['PRODUTOR']), notificationController.listar);
router.patch('/:id/lida', verifyToken, requireRole(['PRODUTOR']), notificationController.marcarComoLida);

module.exports = router;