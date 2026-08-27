# SISFEIRA - Sistema de Gestão de Pedidos para Feiras Locais

## Sobre o Projeto
O **SISFEIRA** é uma aplicação web desenvolvida para conectar produtores da agricultura familiar do Amazonas aos seus clientes. O sistema disponibiliza um catálogo semanal de produtos, permitindo a gestão de pedidos antecipados para reduzir o desperdício de alimentos e ampliar o alcance de vendas da feira local.

## Tecnologias Utilizadas
* **Front-end:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+), abordagem *Zero-Build-Step*.
* **Back-end:** Node.js (LTS), Express.js[cite: 1].
* **Banco de Dados:** PostgreSQL (driver `pg` nativo)[cite: 1].
* **Autenticação e Segurança:** JWT (JSON Web Tokens) e bcrypt[cite: 1].
* **Infraestrutura:** Host Único Bare-Metal (Debian/Linux), execução nativa sem contêineres.

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
   
