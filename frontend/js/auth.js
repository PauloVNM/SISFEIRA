// frontend/js/auth.js
function salvarSessao(token, usuario) {
  localStorage.setItem('sisfeira_token', token);
  localStorage.setItem('sisfeira_user', JSON.stringify(usuario));
}

function obterSessao() {
  const token = localStorage.getItem('sisfeira_token');
  const usuarioStr = localStorage.getItem('sisfeira_user');
  if (!token || !usuarioStr) return null;
  
  try {
    return { token, usuario: JSON.parse(usuarioStr) };
  } catch (e) {
    return null;
  }
}

function encerrarSessao() {
  localStorage.removeItem('sisfeira_token');
  localStorage.removeItem('sisfeira_user');
  window.location.href = '/login.html';
}

function verificarAutenticacaoProtegida(perfisPermitidos = []) {
  const sessao = obterSessao();
  
  if (!sessao) {
    window.location.href = '/login.html';
    return false;
  }

  if (perfisPermitidos.length > 0 && !perfisPermitidos.includes(sessao.usuario.perfil)) {
    encerrarSessao();
    return false;
  }
  
  return true;
}