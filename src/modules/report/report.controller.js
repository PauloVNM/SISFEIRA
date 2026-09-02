// src/modules/report/report.controller.js
const reportService = require('./report.service');
const asyncHandler = require('../../middlewares/async.middleware');

class ReportController {
  obterRelatorioVendas = asyncHandler(async (req, res) => {
    const relatorio = await reportService.gerarRelatorioVendas(req.user.id);
    res.status(200).json(relatorio);
  });
}

module.exports = new ReportController();