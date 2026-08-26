# Frontend: SISFEIRA

## 1. Organização Física (Structure)

A interface web segue o modelo *Zero-Build-Step* (sem ferramentas como Webpack ou Vite), operando como uma Multi-Page Application (MPA) servida estaticamente pelo próprio Express na pasta `frontend/`[cite: 5]. O foco é garantir leveza e velocidade de carregamento em dispositivos móveis[cite: 5].

```text
frontend/
├── assets/                 # Imagens estáticas, ícones e logotipos
├── css/                    # Folhas de estilo (arquitetura CSS pura)
│   ├── variables.css       # Variáveis globais (cores, fontes, espaçamentos)
│   ├── global.css          # Resets e estilos base
│   └── components.css      # Estilos de cards, botões, modais e formulários
├── js/                     # Lógica em Vanilla JS (ES6+)
│   ├── api.js              # Interceptador centralizado para chamadas fetch()
│   ├── auth.js             # Controle de sessão e leitura de JWT
│   ├── cart.js             # Manipulação do carrinho via localStorage
│   └── pages/              # Scripts específicos por página (ex: catalogo.js)
├── index.html              # Landing page e catálogo público
├── login.html              # Tela de autenticação e cadastro
├── carrinho.html           # Tela de revisão e fechamento de pedido
├── comprovante.html        # Exibição do resumo do pedido
└── painel-produtor.html    # Área restrita do feirante
```

---

## 2. Roteamento e Navegação (Routing)

Como não há um framework reativo (como React Router), o roteamento ocorre via navegação nativa do navegador entre os arquivos HTML[cite: 5].

* **Navegação Pública:** Links simples em âncoras HTML (`<a href="login.html">`) guiando o usuário pelas telas de catálogo e carrinho[cite: 5].
* **Proteção de Rotas Visuais:** Telas restritas (como `painel-produtor.html`) possuem um script de bloqueio executado imediatamente no evento `DOMContentLoaded`[cite: 5].
  * O script `auth.js` verifica a existência e validade do token JWT no `localStorage`[cite: 5].
  * Se o token não existir, estiver expirado ou o perfil do usuário não for compatível com a tela (ex: cliente tentando acessar painel do produtor), o script interrompe a renderização e redireciona forçadamente via `window.location.replace('/login.html')`[cite: 5].
  * **Camada Real de Autorização (Segurança):** A verificação visual em `auth.js` serve exclusivamente para melhorar a experiência do usuário (UX), evitando a renderização desnecessária de elementos do painel. A segurança e proteção dos dados residem obrigatoriamente no back-end, que rejeita qualquer chamada de API com token inválido ou perfil incompatível retornando o status HTTP `403 Forbidden`.

---

## 3. Componentização e Nomenclatura (Components)

Sem frameworks, a "componentização" baseia-se em funções JavaScript retornando *Template Literals* (strings HTML) e classes CSS reaproveitáveis[cite: 5].

* **Funções de Renderização:** Elementos que se repetem (como cards de produto ou linhas de relatório) são renderizados por funções puras[cite: 5].
* **Prevenção contra XSS:** A injeção direta de variáveis expõe a interface a vulnerabilidades de Cross-Site Scripting (XSS) caso textos com tags `<script>` ou atributos maliciosos sejam cadastrados. Para mitigar esse risco sem introduzir dependências externas, é obrigatória a utilização de uma função de sanitização nativa (`escapeHTML`) antes de interpolar os textos.

  ```javascript
  // Função utilitária de sanitização
  function escapeHTML(str) {
      const p = document.createElement('p');
      p.textContent = str || '';
      return p.innerHTML;
  }

  // Exemplo de Componente em JS com tratamento seguro
  function renderProdutoCard(produto) {
      return `
          <article class="card-produto">
              <h3>${escapeHTML(produto.nome)}</h3>
              <p>${escapeHTML(produto.descricao)}</p>
              <span class="preco">R$ ${produto.preco} /${escapeHTML(produto.unidade_medida)}</span>
              <button onclick="adicionarAoCarrinho('${produto.id}')">Comprar</button>
          </article>
      `;
  }
  ```
* **Responsabilidade:** O HTML estático contém as cascas estruturais (ex: `<div id="catalogo-grid"></div>`), e o JavaScript preenche esse conteúdo dinamicamente após consultar a API[cite: 5].

---

## 4. Gerenciamento de Estado (State Management)

O estado da aplicação é segmentado entre memória temporária de tela e armazenamento persistente no navegador[cite: 5].

* **`localStorage` (Estado Global Persistente):**
  * `sisfeira_token`: Armazena o JWT retornado pela API no login[cite: 5].
  * `sisfeira_user`: Dados decodificados básicos (ID, nome, perfil) para evitar cálculos repetitivos[cite: 5].
  * `sisfeira_cart`: Array de objetos representando os itens selecionados (produto_id, quantidade, preço_congelado)[cite: 5]. Permite que o cliente navegue entre páginas sem perder o carrinho[cite: 5].
* **Memória JS (Estado Local):** Controle de modais abertos, abas de relatórios e mensagens instantâneas de erro/sucesso[cite: 5].

### 4.1 Fluxo de Dados (Data Flow) - Exemplo: Carrinho de Compras

```mermaid
flowchart TD
    Acao[Cliente clica em "Adicionar ao Carrinho"] --> Valida[JS: Valida produto e quantidade]
    Valida --> AtualizaMem[JS: Atualiza Array do Carrinho na Memória]
    AtualizaMem --> Persiste[(localStorage.setItem)]
    Persiste --> RenderUI[JS: Atualiza contador visual no cabeçalho]
    
    AcaoCheckout[Cliente clica em "Confirmar Pedido"] --> PreparaPayload[JS: Lê carrinho do localStorage e Token]
    PreparaPayload --> ChamadaAPI[fetch('/api/pedidos', { POST })]
    ChamadaAPI -->|Sucesso (201)| Limpa[localStorage.removeItem('sisfeira_cart')]
    Limpa --> Redireciona[Redireciona para comprovante.html]
```

---

## 5. Estilização (Styling)

A interface atende ao requisito de responsividade nativa (RNF05)[cite: 5], priorizando dispositivos móveis[cite: 5].

* **Metodologia:** Utilização de Flexbox para alinhamentos unidimensionais (barras de navegação, listas) e CSS Grid para layouts estruturais (catálogo de produtos em colunas adaptativas)[cite: 5].
* **Variáveis CSS (`:root`):** Padronização de identidade visual focada no contexto agrícola[cite: 5].
  ```css
  :root {
      --cor-primaria: #2E7D32; /* Verde floresta */
      --cor-secundaria: #F9A825; /* Amarelo terroso */
      --cor-fundo: #FAFAFA;
      --cor-texto: #333333;
      --fonte-principal: 'Inter', system-ui, sans-serif;
  }
  ```
* **Mobile-First:** As regras CSS padrão visam telas pequenas (smartphones)[cite: 5]. Modificações para desktop são feitas via Media Queries (`@media (min-width: 768px)`)[cite: 5].

---

## 6. Integração com API (API Integration)

Para evitar repetição de código (`DRY`), todas as requisições HTTP são centralizadas em um módulo utilitário `api.js` usando a `Fetch API` nativa[cite: 5].

* **Interceptador Customizado (`apiFetch`):**
  Uma função envoltória (wrapper) em torno do `fetch()` que se responsabiliza por[cite: 5]:
  1. Anexar automaticamente o cabeçalho `Authorization: Bearer <token>` se ele existir no `localStorage`[cite: 5].
  2. Adicionar o cabeçalho `Content-Type: application/json`[cite: 5].
  3. Formatar o corpo da requisição usando `JSON.stringify()`[cite: 5].
  4. Tratar respostas globais (ex: se a API retornar `401 Unauthorized`, a função invoca automaticamente a limpeza do `localStorage` e envia o usuário para a tela de login)[cite: 5].
* **Feedback Visual (Loadings):**
  Durante chamadas de rede lentas, o botão que disparou a ação recebe uma classe `.btn-loading` (alterando o texto para "Aguarde..." e bloqueando duplo clique) e a remove no bloco `finally` da requisição, garantindo usabilidade clara (RNF03)[cite: 5].