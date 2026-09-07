// src/modules/order/order.service.js
const orderRepository = require('./order.repository');
const { enviarEmailNotificacao } = require('../../config/mailer');

function gerarTemplateEmailPedido({ produtorNome, comprovanteCodigo, dataPedido, itens }) {
  const linhasItens = itens.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E0E0E0; font-size: 14px; color: #333333;">
        <strong>${item.nome}</strong>
      </td>
      <td align="right" style="padding: 10px 12px; border-bottom: 1px solid #E0E0E0; font-size: 14px; font-weight: 600; color: #2E7D32;">
        ${item.quantidade} ${item.unidade_medida || 'un'}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Novo Pedido Recebido</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F4F6F8; padding: 20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #E0E0E0;">
              
              <!-- Cabeçalho -->
              <tr>
                <td style="background-color: #2E7D32; padding: 24px 30px; text-align: left;">
                  <h1 style="margin: 0; font-size: 22px; color: #FFFFFF; font-weight: 700; letter-spacing: 0.5px;">🌱 SISFEIRA</h1>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #E8F5E9;">Gestão de Pedidos para Feiras Locais</p>
                </td>
              </tr>

              <!-- Conteúdo Principal -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1B5E20;">Olá, ${produtorNome}!</h2>
                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.5; color: #555555;">
                    Você recebeu uma nova encomenda na edição ativa da feira. Um cliente concluiu um pedido contendo itens da sua banca.
                  </p>

                  <!-- Caixa de Destaque do Pedido -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FBF9; border-left: 4px solid #2E7D32; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                    <tr>
                      <td>
                        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #777777; font-weight: 600; letter-spacing: 0.5px;">Código do Comprovante</span>
                        <span style="display: block; font-size: 20px; font-weight: 700; color: #2E7D32; margin-top: 4px;">${comprovanteCodigo}</span>
                        <span style="display: block; font-size: 13px; color: #666666; margin-top: 6px;">Recebido em: ${dataPedido}</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Tabela de Produtos Solicitados -->
                  <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #333333; text-transform: uppercase; letter-spacing: 0.5px;">Itens para Separação:</h3>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                      <tr style="background-color: #FAFAFA;">
                        <th align="left" style="padding: 10px 12px; border-bottom: 2px solid #E0E0E0; font-size: 13px; color: #666666; font-weight: 600;">Produto</th>
                        <th align="right" style="padding: 10px 12px; border-bottom: 2px solid #E0E0E0; font-size: 13px; color: #666666; font-weight: 600;">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${linhasItens}
                    </tbody>
                  </table>

                  <!-- Botão de Ação (CTA) -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="http://localhost:3000/painel-produtor.html" target="_blank" style="display: inline-block; background-color: #2E7D32; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);">
                          Acessar Painel do Produtor
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Rodapé -->
              <tr>
                <td style="background-color: #FAFAFA; border-top: 1px solid #EEEEEE; padding: 20px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.4;">
                    Este é um aviso automático gerado pelo sistema SISFEIRA.<br>
                    Agricultura familiar conectada ao consumidor local.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

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

    const dataFormatada = new Date().toLocaleString('pt-BR', { timeZone: 'America/Manaus', dateStyle: 'short', timeStyle: 'short' });
    const produtorIds = [...new Set(dbProdutos.map(p => p.produtor_id))];
    const produtores = await orderRepository.buscarEmailsProdutoresPorIds(produtorIds);

    produtores.forEach(produtor => {
      const itensDoProdutor = itens.map(item => {
        const prod = dbProdutos.find(p => p.id === item.produto_id && p.produtor_id === produtor.id);
        if (!prod) return null;
        return {
          nome: prod.nome,
          quantidade: item.quantidade,
          unidade_medida: prod.unidade_medida
        };
      }).filter(Boolean);

      enviarEmailNotificacao({
        destinatario: produtor.email,
        assunto: `Novo Pedido Recebido [${pedido.comprovante_codigo}] - SISFEIRA`,
        texto: `Olá ${produtor.nome}, você recebeu uma nova encomenda no pedido ${pedido.comprovante_codigo}. Itens: ${itensDoProdutor.map(i => `${i.nome} (${i.quantidade} ${i.unidade_medida || 'un'})`).join(', ')}. Acesse o painel para preparar os produtos.`,
        html: gerarTemplateEmailPedido({
          produtorNome: produtor.nome,
          comprovanteCodigo: pedido.comprovante_codigo,
          dataPedido: dataFormatada,
          itens: itensDoProdutor
        })
      }).catch(err => console.error('[Mailer Async Error]:', err.message));
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