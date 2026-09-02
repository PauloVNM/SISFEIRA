// src/modules/report/report.service.js
const reportRepository = require('./report.repository');

class ReportService {
  async gerarRelatorioVendas(produtorId) {
    const [metricas, itens] = await Promise.all([
      reportRepository.obterMetricasGerais(produtorId),
      reportRepository.obterItensMaisVendidos(produtorId)
    ]);

    return {
      total_faturado: parseFloat(metricas.total_faturado) || 0,
      total_pedidos: parseInt(metricas.total_pedidos, 10) || 0,
      itens_mais_vendidos: itens.map(item => ({
        produto_nome: item.produto_nome,
        quantidade_vendida: parseInt(item.quantidade_vendida, 10),
        subtotal: parseFloat(item.subtotal)
      }))
    };
  }
}

module.exports = new ReportService();