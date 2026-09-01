// src/modules/catalog/catalog.controller.js
const catalogService = require('./catalog.service');
const asyncHandler = require('../../middlewares/async.middleware');

class CatalogController {
  listarCatalogo = asyncHandler(async (req, res) => {
    const produtos = await catalogService.listarCatalogo();
    res.status(200).json(produtos);
  });

  listarProdutosDoProdutor = asyncHandler(async (req, res) => {
    const produtos = await catalogService.listarProdutosDoProdutor(req.user.id);
    res.status(200).json(produtos);
  });

  criarProduto = asyncHandler(async (req, res) => {
    const produto = await catalogService.criarProduto(req.user.id, req.body);
    res.status(201).json(produto);
  });

  atualizarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const produto = await catalogService.atualizarProduto(id, req.user.id, req.body);
    res.status(200).json(produto);
  });

  desativarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const resultado = await catalogService.desativarProduto(id, req.user.id);
    res.status(200).json(resultado);
  });
}

module.exports = new CatalogController();