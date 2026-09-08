# SISFEIRA - Sistema de Gestão de Pedidos para Feiras Locais

## Sobre o Projeto
O **SISFEIRA** é uma aplicação web desenvolvida para conectar produtores da agricultura familiar do Amazonas aos seus clientes. O sistema disponibiliza um catálogo semanal de produtos, permitindo a gestão de pedidos antecipados para reduzir o desperdício de alimentos e ampliar o alcance de vendas da feira local.

## Tecnologias Utilizadas
* **Front-end:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+), abordagem *Zero-Build-Step*.
* **Back-end:** Node.js (LTS), Express.js[cite: 1].
* **Banco de Dados:** PostgreSQL (driver `pg` nativo)[cite: 1].
* **Autenticação e Segurança:** JWT (JSON Web Tokens) e bcrypt[cite: 1].
* **Infraestrutura:** Host Único Bare-Metal (Debian/Linux), execução nativa sem contêineres.
# 🛒 SISFEIRA - Sistema de Gestão de Pedidos para Feiras Locais

## 📖 Sobre o Projeto
O **SISFEIRA** é uma aplicação web desenvolvida para conectar produtores da agricultura familiar do Amazonas aos seus clientes. O sistema disponibiliza um catálogo semanal de produtos, permitindo a gestão de pedidos antecipados para reduzir o desperdício de alimentos e ampliar o alcance de vendas da feira local[cite: 2].

## 🔗 Links Importantes do Projeto
* **[Documentação Oficial (Google Docs)](https://docs.google.com/document/d/1DFGg4_pMNMnNN6FmTHnPgCBVggWwYpS9olN2r4RjfD0/edit?usp=sharing)**
* **[Gestão e Tarefas (Trello)](https://trello.com/invite/b/6a4ba98f0013d6940bbe1cfe/ATTI136f988dc7bf8813f98c99b5817ac87b25281C31/sisfeira-projeto-5)**

## 🛠️ Tecnologias Utilizadas

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</div>

<br>

* **Front-end:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+), abordagem *Zero-Build-Step*[cite: 2].
* **Back-end:** Node.js (LTS), Express.js[cite: 2].
* **Banco de Dados:** PostgreSQL (driver `pg` nativo)[cite: 2].
* **Autenticação e Segurança:** JWT (JSON Web Tokens) e bcrypt[cite: 2].
* **Infraestrutura:** Host Único Bare-Metal (Debian/Linux), execução nativa sem contêineres[cite: 2].

---

## 🚀 Como Executar o Projeto Localmente

### 📌 Pré-requisitos
* **Node.js:** v18 ou v20 LTS[cite: 2]
* **PostgreSQL:** v15 ou superior[cite: 2]
* **Git**[cite: 2]

### ⚙️ Passo a Passo

1. **Clone o repositório:**[cite: 2]
   ```bash
   git clone [https://github.com/seu-usuario/sisfeira.git](https://github.com/seu-usuario/sisfeira.git)
   cd sisfeira
   ```

2. **Instale as dependências do back-end:**[cite: 2]
   ```bash
   npm install
   ```

3. **Configure o Banco de Dados:**
   Acesse seu cliente do PostgreSQL (ex: `psql`) e crie o banco[cite: 2]. Em seguida, aplique a estrutura e os dados mockados de teste:[cite: 2]
   ```bash
   psql -U postgres -c "CREATE DATABASE sisfeira_db;"
   psql -U postgres -d sisfeira_db -f src/database/migrations/01_schema_inicial.sql
   psql -U postgres -d sisfeira_db -f src/database/seeds/01_mock_data.sql
   ```

4. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo e edite-o com as suas credenciais locais do banco de dados:[cite: 2]
   ```bash
   cp .env.example .env
   ```

5. **Inicie o Servidor:**[cite: 2]
   ```bash
   npm start
   ```
   A aplicação (API e Interface Web) estará disponível no seu navegador em: `http://localhost:3000`[cite: 2].

---

## 📚 Mapa da Documentação (Atalhos)

Toda a arquitetura, regras de negócio e especificações técnicas estão documentadas na pasta `docs/`[cite: 2]. Recomendamos a leitura na seguinte ordem:[cite: 2]

### 1️⃣ Descoberta e Regras de Negócio
* [product.md](docs/product.md) - O propósito do sistema, escopo do MVP, perfis de usuários, glossário, regras de negócio e requisitos funcionais/não funcionais[cite: 2].
* [domain.md](docs/domain.md) - Modelagem das entidades principais, relacionamentos, enums de status e fluxo do ciclo de vida dos pedidos[cite: 2].

### 2️⃣ Planejamento e Entregáveis
* [features.md](docs/features.md) - Mapeamento de módulos, backlog de features (FEATs), limites de escopo e raio de impacto no código[cite: 2].

### 3️⃣ Arquitetura e Engenharia (O Motor do Sistema)
* [architecture.md](docs/architecture.md) - Visão macro da stack de tecnologia, modelo mental da arquitetura e estratégia de segurança[cite: 2].
* [database.md](docs/database.md) - Esquema físico das tabelas do PostgreSQL, tipos de dados, chaves estrangeiras e diagrama ER[cite: 2].
* [backend.md](docs/backend.md) - Estrutura de pastas do Node.js/Express, roteamento, ciclo de vida da requisição e tratamento de erros[cite: 2].
* [api.md](docs/api.md) - Contrato oficial da API REST, rotas protegidas/públicas, payloads esperados e respostas de erro[cite: 2].
* [frontend.md](docs/frontend.md) - Estrutura da UI em Vanilla JS, state management no `localStorage` e integração com a API via Fetch[cite: 2].
* [infrastructure.md](docs/infrastructure.md) - Ambiente de operação Linux, variáveis de ambiente necessárias e monitoramento de logs[cite: 2].

---

## 🤖 Mapa de Leitura para Inteligência Artificial (AI Context Guide)

Se você é um assistente de IA interagindo com este repositório para sugerir, refatorar ou depurar código, você **deve** alinhar seu contexto seguindo estes passos antes de qualquer intervenção:[cite: 2]

1. **Contexto de Domínio:** Entenda o problema acessando `docs/product.md` e `docs/domain.md`[cite: 2]. Tenha extrema atenção às restrições de regras de negócio (ex: o produtor só enxerga os próprios pedidos)[cite: 2].
2. **Restrições Arquiteturais (`docs/architecture.md`):** O projeto foi desenhado sob premissas estritas de simplicidade[cite: 2]. **Não recomende, utilize ou adicione:** ORMs (como Prisma ou Sequelize), ferramentas de build front-end (Webpack, Vite, Babel), frameworks reativos (React, Vue, Angular) ou contêineres Docker[cite: 2]. Tudo deve ser resolvido com Node.js + Express + `pg` driver + Vanilla JS[cite: 2].
3. **Contratos Estritos (`docs/api.md` & `docs/database.md`):** Qualquer nova funcionalidade no back-end deve respeitar as colunas físicas mapeadas no schema e os padrões de payloads REST documentados[cite: 2]. Nunca adicione colunas "silenciosamente" sem atualizar a documentação[cite: 2].
4. **Comportamento em Interface (`docs/frontend.md`):** Componentes visuais são manipulados via manipulação direta de DOM nativo e `Template Literals`[cite: 2]. O armazenamento de estado transitório (carrinho, token) utiliza exclusivamente o `localStorage`[cite: 2].
5. **Dúvidas e Lacunas:** Se uma solicitação técnica gerar conflito com as regras documentadas ou carecer de especificações (ex: "Crie a tela X" mas não há API mapeada), você deve sinalizar a lacuna ao operador antes de gerar código especulativo[cite: 2].
---

## Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js:** v18 ou v20 LTS
* **PostgreSQL:** v15 ou superior
* **Git**

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/sisfeira.git](https://github.com/seu-usuario/sisfeira.git)
   cd sisfeira
   ```

2. **Instale as dependências do back-end:**
   ```bash
   npm install
   ```

3. **Configure o Banco de Dados:**
   Acesse seu cliente do PostgreSQL (ex: `psql`) e crie o banco. Em seguida, aplique a estrutura e os dados mockados de teste:
   ```bash
   psql -U postgres -c "CREATE DATABASE sisfeira_db;"
   psql -U postgres -d sisfeira_db -f src/database/migrations/01_schema_inicial.sql
   psql -U postgres -d sisfeira_db -f src/database/seeds/01_mock_data.sql
   ```

4. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo e edite-o com as suas credenciais locais do banco de dados:
   ```bash
   cp .env.example .env
   ```

5. **Inicie o Servidor:**
   ```bash
   npm start
   ```
   A aplicação (API e Interface Web) estará disponível no seu navegador em: `http://localhost:3000`.

---

## Mapa da Documentação (Atalhos)

Toda a arquitetura, regras de negócio e especificações técnicas estão documentadas na pasta `docs/`. Recomendamos a leitura na seguinte ordem:

### 1. Descoberta e Regras de Negócio
* [product.md](docs/product.md) - O propósito do sistema, escopo do MVP, perfis de usuários, glossário, regras de negócio e requisitos funcionais/não funcionais[cite: 1].
* [domain.md](docs/domain.md) - Modelagem das entidades principais, relacionamentos, enums de status e fluxo do ciclo de vida dos pedidos[cite: 1].

### 2. Planejamento e Entregáveis
* [features.md](docs/features.md) - Mapeamento de módulos, backlog de features (FEATs), limites de escopo e raio de impacto no código[cite: 1].

### 3. Arquitetura e Engenharia (O Motor do Sistema)
* [architecture.md](docs/architecture.md) - Visão macro da stack de tecnologia, modelo mental da arquitetura e estratégia de segurança.
* [database.md](docs/database.md) - Esquema físico das tabelas do PostgreSQL, tipos de dados, chaves estrangeiras e diagrama ER.
* [backend.md](docs/backend.md) - Estrutura de pastas do Node.js/Express, roteamento, ciclo de vida da requisição e tratamento de erros.
* [api.md](docs/api.md) - Contrato oficial da API REST, rotas protegidas/públicas, payloads esperados e respostas de erro.
* [frontend.md](docs/frontend.md) - Estrutura da UI em Vanilla JS, state management no `localStorage` e integração com a API via Fetch.
* [infrastructure.md](docs/infrastructure.md) - Ambiente de operação Linux, variáveis de ambiente necessárias e monitoramento de logs.

---

## Mapa de Leitura para Inteligência Artificial (AI Context Guide)

Se você é um assistente de IA interagindo com este repositório para sugerir, refatorar ou depurar código, você **deve** alinhar seu contexto seguindo estes passos antes de qualquer intervenção:

1. **Contexto de Domínio:** Entenda o problema acessando `docs/product.md` e `docs/domain.md`. Tenha extrema atenção às restrições de regras de negócio (ex: o produtor só enxerga os próprios pedidos).
2. **Restrições Arquiteturais (`docs/architecture.md`):** O projeto foi desenhado sob premissas estritas de simplicidade. **Não recomende, utilize ou adicione:** ORMs (como Prisma ou Sequelize), ferramentas de build front-end (Webpack, Vite, Babel), frameworks reativos (React, Vue, Angular) ou contêineres Docker. Tudo deve ser resolvido com Node.js + Express + `pg` driver + Vanilla JS.
3. **Contratos Estritos (`docs/api.md` & `docs/database.md`):** Qualquer nova funcionalidade no back-end deve respeitar as colunas físicas mapeadas no schema e os padrões de payloads REST documentados. Nunca adicione colunas "silenciosamente" sem atualizar a documentação.
4. **Comportamento em Interface (`docs/frontend.md`):** Componentes visuais são manipulados via manipulação direta de DOM nativo e `Template Literals`. O armazenamento de estado transitório (carrinho, token) utiliza exclusivamente o `localStorage`.
5. **Dúvidas e Lacunas:** Se uma solicitação técnica gerar conflito com as regras documentadas ou carecer de especificações (ex: "Crie a tela X" mas não há API mapeada), você deve sinalizar a lacuna ao operador antes de gerar código especulativo.
   
