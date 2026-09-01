// src/modules/catalog/catalog.service.js
const catalogRepository = require('./catalog.repository');

class CatalogService {
  async listarCatalogo() {
    const produtos = await catalogRepository.listarCatalogoPublico();
    return produtos.map(p => ({
      ...p,
      preco: Number(p.preco)
    }));
  }

  async listarProdutosDoProdutor(produtorId) {
    const produtos = await catalogRepository.listarPorProdutor(produtorId);
    return produtos.map(p => ({
      ...p,
      preco: Number(p.preco)
    }));
  }

  async criarProduto(produtorId, dados) {
    const { nome, descricao, preco, unidade_medida } = dados;

    if (!nome || preco === undefined || !unidade_medida) {
      const error = new Error('Campos obrigatórios: nome, preco e unidade_medida');
      error.statusCode = 400;
      throw error;
    }

    if (Number(preco) < 0) {
      const error = new Error('O preço não pode ser negativo');
      error.statusCode = 400;
      throw error;
    }

    return await catalogRepository.criarProduto({
      produtor_id: produtorId,
      nome,
      descricao: descricao || null,
      preco,
      unidade_medida
    });
  }

  async atualizarProduto(id, produtorId, dados) {
    const produtoExistente = await catalogRepository.buscarPorId(id);
    
    if (!produtoExistente) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (produtoExistente.produtor_id !== produtorId) {
      const error = new Error('Acesso negado para modificar este produto');
      error.statusCode = 403;
      throw error;
    }

    const { nome, descricao, preco, unidade_medida } = dados;

    return await catalogRepository.atualizarProduto(id, produtorId, {
      nome: nome || produtoExistente.nome,
      descricao: descricao !== undefined ? descricao : produtoExistente.descricao,
      preco: preco !== undefined ? preco : produtoExistente.preco,
      unidade_medida: unidade_medida || produtoExistente.unidade_medida
    });
  }

  async desativarProduto(id, produtorId) {
    const produtoExistente = await catalogRepository.buscarPorId(id);
    
    if (!produtoExistente) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (produtoExistente.produtor_id !== produtorId) {
      const error = new Error('Acesso negado para desativar este produto');
      error.statusCode = 403;
      throw error;
    }

    await catalogRepository.desativarProduto(id, produtorId);
    return { mensagem: 'Produto desativado com sucesso' };
  }
}

module.exports = new CatalogService();