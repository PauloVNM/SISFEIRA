// src/modules/order/order.service.js
const orderRepository = require('./order.repository');

class OrderService {
  async listarPontosRetirada() {
    return await orderRepository.listarPontosRetirada();
  }

  async fecharPedido(clienteId, { ponto_retirada_id, itens }) {
    if (!ponto_retirada_id) {
      const error = new Error('Ponto de retirada é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      const error = new Error('O carrinho não pode estar vazio');
      error.statusCode = 400;
      throw error;
    }

    const ponto = await orderRepository.buscarPontoRetiradaPorId(ponto_retirada_id);
    if (!ponto) {
      const error = new Error('Ponto de retirada inválido');
      error.statusCode = 404;
      throw error;
    }

    const edicao = await orderRepository.buscarEdicaoAtiva();
    if (!edicao) {
      const error = new Error('Não há nenhuma edição de feira ativa no momento');
      error.statusCode = 400;
      throw error;
    }

    const idsProdutos = itens.map(i => i.produto_id);
    const dbProdutos = await orderRepository.buscarProdutosPorIds(idsProdutos);

    if (dbProdutos.length !== idsProdutos.length) {
      const error = new Error('Um ou mais produtos não estão mais disponíveis');
      error.statusCode = 400;
      throw error;
    }

    let valor_total = 0;
    const itensMapeados = [];
    const produtoresSet = new Set();

    for (const reqItem of itens) {
      if (reqItem.quantidade <= 0) {
        const error = new Error('Quantidade inválida para o produto ' + reqItem.produto_id);
        error.statusCode = 400;
        throw error;
      }
      
      const dbProd = dbProdutos.find(p => p.id === reqItem.produto_id);
      const precoUnitario = Number(dbProd.preco);
      valor_total += precoUnitario * reqItem.quantidade;
      
      itensMapeados.push({
        produto_id: reqItem.produto_id,
        quantidade: reqItem.quantidade,
        preco_unitario: precoUnitario
      });

      produtoresSet.add(dbProd.produtor_id);
    }

    const comprovante_codigo = 'SISF-' + Math.floor(1000 + Math.random() * 9000);
    const status = 'RECEBIDO';

    const notificacoes = Array.from(produtoresSet).map(produtor_id => ({
      produtor_id,
      mensagem: 'Você tem um novo pedido com itens a serem preparados'
    }));

    const pedido = await orderRepository.criarPedidoTransacional({
      cliente_id: clienteId,
      edicao_id: edicao.id,
      ponto_retirada_id,
      comprovante_codigo,
      status,
      valor_total,
      itens: itensMapeados,
      notificacoes
    });

    return pedido;
  }

  async obterComprovante(pedidoId, usuarioId, perfil) {
    const comprovante = await orderRepository.buscarComprovantePorId(pedidoId, usuarioId, perfil);
    if (!comprovante) {
      const error = new Error('Pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    comprovante.valor_total = Number(comprovante.valor_total);
    comprovante.itens = comprovante.itens.map(item => ({
      ...item,
      preco_unitario: Number(item.preco_unitario)
    }));
    
    return comprovante;
  }

  async listarHistoricoCliente(clienteId) {
    const historico = await orderRepository.listarPorCliente(clienteId);
    return historico.map(p => ({
      ...p,
      valor_total: Number(p.valor_total)
    }));
  }

  async listarPedidosProdutor(produtorId) {
    const pedidos = await orderRepository.listarPorProdutor(produtorId);
    
    for (const pedido of pedidos) {
      pedido.valor_total = Number(pedido.valor_total);
      pedido.itens = await orderRepository.buscarItensDoProdutorNoPedido(pedido.id, produtorId);
    }
    
    return pedidos;
  }

  async atualizarStatusPedido(pedidoId, produtorId, novoStatus) {
    const statusValidos = ['RECEBIDO', 'EM_PREPARACAO', 'ENTREGUE'];
    if (!statusValidos.includes(novoStatus)) {
      const error = new Error('Status inválido');
      error.statusCode = 400;
      throw error;
    }

    const pedido = await orderRepository.buscarStatusAtual(pedidoId);
    if (!pedido) {
      const error = new Error('Pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const pertence = await orderRepository.verificarProdutorPertenceAoPedido(pedidoId, produtorId);
    if (!pertence) {
      const error = new Error('Acesso não autorizado para alterar este pedido');
      error.statusCode = 403;
      throw error;
    }

    const statusAtual = pedido.status;
    if (statusAtual === 'RECEBIDO' && novoStatus !== 'EM_PREPARACAO') {
      const error = new Error('Transição inválida: pedidos recebidos só podem avançar para EM_PREPARACAO');
      error.statusCode = 400;
      throw error;
    }
    if (statusAtual === 'EM_PREPARACAO' && novoStatus !== 'ENTREGUE') {
      const error = new Error('Transição inválida: pedidos em preparação só podem avançar para ENTREGUE');
      error.statusCode = 400;
      throw error;
    }
    if (statusAtual === 'ENTREGUE') {
      const error = new Error('Transição inválida: pedido já se encontra finalizado como ENTREGUE');
      error.statusCode = 400;
      throw error;
    }

    const atualizado = await orderRepository.atualizarStatus(pedidoId, novoStatus);
    
    return { 
      sucesso: true, 
      mensagem: `Status do pedido alterado para ${novoStatus} com sucesso.`,
      status: atualizado.status
    };
  }
}

module.exports = new OrderService();