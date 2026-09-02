// src/modules/notification/notification.service.js
const notificationRepository = require('./notification.repository');

class NotificationService {
  async listarNotificacoes(produtorId) {
    return await notificationRepository.listarPorProdutor(produtorId);
  }

  async marcarLida(notificacaoId, produtorId) {
    const result = await notificationRepository.marcarComoLida(notificacaoId, produtorId);
    
    if (!result) {
      const error = new Error('Notificação não encontrada ou não autorizada');
      error.statusCode = 404;
      throw error;
    }
    
    return { mensagem: 'Notificação marcada como lida com sucesso' };
  }
}

module.exports = new NotificationService();