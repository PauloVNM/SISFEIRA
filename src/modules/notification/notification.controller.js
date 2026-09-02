// src/modules/notification/notification.controller.js
const notificationService = require('./notification.service');
const asyncHandler = require('../../middlewares/async.middleware');

class NotificationController {
  listar = asyncHandler(async (req, res) => {
    const notificacoes = await notificationService.listarNotificacoes(req.user.id);
    res.status(200).json(notificacoes);
  });

  marcarComoLida = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const produtorId = req.user.id;
    const resultado = await notificationService.marcarLida(id, produtorId);
    res.status(200).json(resultado);
  });
}

module.exports = new NotificationController();