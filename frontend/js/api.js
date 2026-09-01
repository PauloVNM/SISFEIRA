// frontend/js/api.js
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };
  
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const token = localStorage.getItem('sisfeira_token');
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const config = { ...options, headers };

  try {
    const response = await fetch('/api' + endpoint, config);
    
    if (response.status === 401) {
      localStorage.removeItem('sisfeira_token');
      localStorage.removeItem('sisfeira_user');
      if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = '/login.html';
      }
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    const data = await response.json();

    if (!response.ok) {
      return Promise.reject(data);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      return Promise.reject({ erro: true, mensagem: 'Erro de conexão com o servidor' });
    }
    return Promise.reject(error);
  }
}