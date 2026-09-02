// frontend/js/cart.js
function obterCarrinho() {
  const cart = localStorage.getItem('sisfeira_cart');
  return cart ? JSON.parse(cart) : [];
}

function salvarCarrinho(itens) {
  localStorage.setItem('sisfeira_cart', JSON.stringify(itens));
  window.dispatchEvent(new Event('cartUpdated'));
}

function adicionarAoCarrinho(produto, quantidade = 1) {
  const carrinho = obterCarrinho();
  const index = carrinho.findIndex(item => item.id === produto.id);
  
  if (index !== -1) {
    carrinho[index].quantidade += quantidade;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      unidade_medida: produto.unidade_medida,
      quantidade: quantidade,
      produtor_nome: produto.produtor_nome
    });
  }
  
  salvarCarrinho(carrinho);
}

function atualizarQuantidade(produtoId, novaQuantidade) {
  let carrinho = obterCarrinho();
  const index = carrinho.findIndex(item => item.id === produtoId);
  
  if (index !== -1) {
    if (novaQuantidade <= 0) {
      carrinho.splice(index, 1);
    } else {
      carrinho[index].quantidade = novaQuantidade;
    }
    salvarCarrinho(carrinho);
  }
}

function removerDoCarrinho(produtoId) {
  let carrinho = obterCarrinho();
  carrinho = carrinho.filter(item => item.id !== produtoId);
  salvarCarrinho(carrinho);
}

function limparCarrinho() {
  localStorage.removeItem('sisfeira_cart');
  window.dispatchEvent(new Event('cartUpdated'));
}

function calcularTotalCarrinho() {
  const carrinho = obterCarrinho();
  return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function obterContadorCarrinho() {
  const carrinho = obterCarrinho();
  return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

function atualizarBadgeCarrinho() {
  const badges = document.querySelectorAll('.cart-count');
  const count = obterContadorCarrinho();
  badges.forEach(badge => {
    badge.textContent = count;
  });
}

window.addEventListener('cartUpdated', atualizarBadgeCarrinho);
document.addEventListener('DOMContentLoaded', atualizarBadgeCarrinho);