# Decisions: SISFEIRA

Este documento consolida o Registro de Decisões de Arquitetura (ADRs) do projeto **SISFEIRA**, formalizando as escolhas técnicas, justificativas de negócio, trade-offs assumidos e alternativas descartadas a partir das discussões de descoberta e viabilidade técnica.

---

### ADR 01: Arquitetura Monolítica Modular em Node.js com Express
* **Status:** Aprovado
* **Contexto:** Necessidade de construir uma API RESTful para suportar as operações de clientes, produtores e administradores da feira (FEAT-01 a FEAT-07), além de entregar os ativos estáticos da interface web responsiva sem sobrecarga de orquestração de rede.
* **Decisão:** Adoção de uma arquitetura monolítica modular orientada a funcionalidades (*feature-based*) em **Node.js (LTS)** utilizando o micro-framework **Express.js**. O servidor Express unifica a entrega dos endpoints da API sob o prefixo `/api` e a distribuição dos arquivos estáticos da interface web através do middleware `express.static('frontend')` na porta unificada `3000`.
* **Rastreabilidade:** Atende diretamente aos módulos de FEAT-01 a FEAT-07, viabilizando o cumprimento de RNF01 (desempenho) e RNF07 (facilidade de manutenção).
* **Alternativas Rejeitadas:**
  * *Arquitetura de Microsserviços:* Descartada por introduzir complexidade desproporcional de infraestrutura, comunicação inter-processos e latência de rede para uma aplicação de escopo local.
  * *Frameworks Opinativos (NestJS, Django, Spring Boot, FastAPI):* Descartados para priorizar o controle direto sobre middlewares, menor pegada de memória e ausência de camadas de abstração desnecessárias.
* **Trade-offs e Mitigações:**
  * *Risco de Acoplamento:* Exige rigor na separação física de pastas em `src/modules/` divididas em `routes`, `controllers`, `services` e `repositories`.

---

### ADR 02: Interface Web com Abordagem *Zero-Build-Step* (Vanilla JS e MPA)
* **Status:** Aprovado
* **Contexto:** Garantir tempo de carregamento inferior a 2 segundos (RNF01) e compatibilidade total com dispositivos móveis de produtores e clientes (RNF05), eliminando gargalos de compatibilidade e etapas intermediárias de compilação.
* **Decisão:** Desenvolvimento de uma **Multi-Page Application (MPA)** baseada estritamente em **HTML5 semântico, CSS3 puro (Flexbox e CSS Grid) e JavaScript nativo (Vanilla JS / ES6+)**. A comunicação com a API é centralizada na função utilitária `apiFetch()` (`frontend/js/api.js`). O estado do carrinho de compras é mantido no cliente via `localStorage` (`sisfeira_cart`).
* **Rastreabilidade:** Atende a RF03, RF04, RF05, RF06, RF07, RNF01, RNF03 e RNF05 (FEAT-02, FEAT-03, FEAT-04 e FEAT-06).
* **Alternativas Rejeitadas:**
  * *Frameworks Reativos (React, Vue, Angular, Svelte):* Rejeitados devido à sobrecarga de dependências no `node_modules`, peso dos pacotes baixados pelo navegador móvel e aumento desnecessário na curva de manutenção.
  * *Ferramentas de Build/Empacotamento (Vite, Webpack, Babel):* Rejeitadas pelo princípio de manter o código-fonte executável diretamente no navegador sem etapas de build.
* **Trade-offs e Mitigações de Segurança:**
  * *Prevenção de XSS:* A interpolação dinâmica de dados vindos da API em *Template Literals* utiliza obrigatoriamente a função nativa de sanitização `escapeHTML()` antes da inserção no DOM.
  * *Camada de Autorização:* A checagem visual em `auth.js` no evento `DOMContentLoaded` serve exclusivamente para aprimorar a experiência do usuário (UX); a segurança e o bloqueio de dados residem obrigatoriamente no back-end.

```javascript
// Padrão de sanitização nativa adotado no front-end
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
```

---

### ADR 03: Persistência em PostgreSQL com Driver Nativo `pg` (Sem ORMs)
* **Status:** Aprovado
* **Contexto:** Necessidade de consistência transacional estrita (ACID) para reserva de pedidos, integridade referencial por chaves estrangeiras e alta performance em consultas agregadas de faturamento (RF08, RNF01, RNF06).
* **Decisão:** Utilização do SGBD relacional **PostgreSQL (v15+)** conectado diretamente pelo driver oficial `pg` (*node-postgres*). Todas as interações com o banco utilizam *Connection Pooling* centralizado em `src/config/db.js` e consultas SQL puras parametrizadas (`$1`, `$2`), descartando o uso de ORMs.
* **Rastreabilidade:** Atende a RF01 a RF10, RNF01, RNF02 e RNF06 (FEAT-01 a FEAT-07).
* **Alternativas Rejeitadas:**
  * *ORMs (Prisma, TypeORM, Sequelize, Knex):* Rejeitados para evitar overhead de abstração, consultas SQL subótimas em relatórios analíticos e dependências externas pesadas.
  * *Stored Procedures Complexas:* Rejeitadas para manter todas as regras de negócio, cálculos e validações centralizadas no back-end Node.js, facilitando a manutenção e testes.
* **Trade-offs e Mitigações:**
  * *Gerenciamento de Transações:* Assegurar que comandos transacionais (`BEGIN`, `COMMIT`, `ROLLBACK`) utilizem um cliente dedicado do pool (`pool.connect()`) com liberação garantida no bloco `finally`.

```javascript
// Padrão transacional obrigatório para fechamento de pedidos
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Execução de inserts e updates relacionados
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

---

### ADR 04: Migrações e Carga Inicial (Seeds) via Scripts SQL Puros
* **Status:** Aprovado
* **Contexto:** Necessidade de versionar o esquema do banco de dados e fornecer uma base de testes homologada (usuários de demonstração, feira ativa, pontos de logística e produtos iniciais) para execução no Debian/Linux.
* **Decisão:** As alterações estruturais e os dados iniciais são organizados em arquivos SQL puros (`src/database/migrations/` e `src/database/seeds/`), versionados no repositório e aplicados manualmente via terminal utilizando o utilitário nativo `psql`.
* **Rastreabilidade:** Atende a FEAT-01, FEAT-02, FEAT-03, RN01, RNF02 e RNF07.
* **Alternativas Rejeitadas:** Ferramentas de terceiros para controle de migrações (Flyway, Liquibase, bibliotecas npm).
* **Trade-offs:** Exige controle manual da ordem de execução dos arquivos no terminal durante a configuração inicial do ambiente.

---

### ADR 05: Autenticação via JWT com RBAC e Isolamento Lógico de Vendas (RN06)
* **Status:** Aprovado
* **Contexto:** Garantir a autenticação segura de clientes e produtores (RF01, RF02, RNF02) e o isolamento de dados de faturamento entre feirantes concorrentes (RN06, RF08).
* **Decisão:** Autenticação *stateless* baseada em **JSON Web Tokens (JWT)** trafegados no cabeçalho `Authorization: Bearer <token>` com tempo de expiração fixado em 8 horas. As senhas são criptografadas de forma irreversível com a biblioteca `bcrypt`. A autorização é controlada pelo middleware `requireRole` com base nos papéis `CLIENTE`, `PRODUTOR` e `ORGANIZACAO`. O isolamento de dados é garantido pela injeção mandatória do `produtor_id` extraído do payload do token nas consultas SQL do repositório.
* **Rastreabilidade:** Atende a RF01, RF02, RF06, RF08, RN06, RNF02 e FEAT-01, FEAT-07.
* **Alternativas Rejeitadas:** Sessões em servidor mantidas em memória/cookies e autenticação por serviços terceiros (OAuth / Auth0).
* **Trade-offs:** O token JWT é armazenado no `localStorage` do navegador para simplicidade na arquitetura Vanilla JS, transferindo a barreira de segurança para a validação estrita no back-end.

---

### ADR 06: Modelo de Notificações e Descarte de WebSockets / APIs de Mensageria
* **Status:** Aprovado
* **Contexto:** Notificar os produtores a cada novo pedido realizado (RF09, RN04, FEAT-05) e fornecer canal de apoio ao contato para a retirada dos produtos (RF05).
* **Decisão:** Estruturação das notificações em dois canais oficiais assíncronos e um recurso auxiliar de comunicação voluntária:
  1. *Canal Oficial Interno:* Persistência de registros na tabela `notificacoes` no fechamento do pedido, consultados sob demanda pelo painel do feirante (`GET /api/notificacoes/produtor`) e atualizados via `PATCH /api/notificacoes/:id/lida`.
  2. *Canal Oficial Transacional:* Disparo assíncrono de e-mails via biblioteca **Nodemailer** configurada com servidor SMTP (utilizando Ethereal Email em ambiente de desenvolvimento).
  3. *Recurso Auxiliar de Contato ("Fale com o Vendedor"):* Geração estritamente visual no front-end de um hiperlink público `wa.me` na tela de comprovante do cliente, sem automações no servidor.
* **Rastreabilidade:** Atende a RF05, RF09, RN04 e FEAT-05.
* **Alternativas Rejeitadas:**
  * *WebSockets (Socket.io) / Server-Sent Events (SSE):* Rejeitados por introduzir conexões persistentes, aumento do consumo de recursos e complexidade desnecessária de sincronização.
  * *Integração com APIs do WhatsApp (Meta Business ou APIs Não Oficiais):* Descartadas devido a custos, burocracia de validação e risco de bloqueio de contas.
  * *Plataformas SaaS de E-mail (EmailJS):* Rejeitadas por limitações de envio nos planos gratuitos e acoplamento a serviços externos.
* **Trade-offs:** A atualização visual de notificações no painel não ocorre por *push* em tempo real, exigindo consulta sob demanda ou recarregamento da página.

---

### ADR 07: Execução Bare-Metal em Host Único Linux Debian (Sem Docker e Sem CI/CD)
* **Status:** Aprovado
* **Contexto:** Definição do ambiente operacional para desenvolvimento, testes e demonstração acadêmica do sistema com foco na simplicidade estrutural.
* **Decisão:** Execução direta no sistema operacional **Linux (Debian)** em modo *Bare-Metal*. O banco de dados PostgreSQL e a aplicação Node.js rodam nativamente na mesma máquina física, iniciados diretamente pelo terminal/VS Code via `npm start`.
* **Rastreabilidade:** Atende a RNF01, RNF06 e RNF07.
* **Alternativas Rejeitadas:**
  * *Contêineres Docker / Docker Compose:* Descartados para evitar sobrecarga de virtualização e camadas adicionais no ambiente de desenvolvimento local.
  * *Esteiras Automatizadas de CI/CD:* Descartadas por serem desproporcionais para um ambiente acadêmico monomáquina.
* **Trade-offs e Mitigações de Segurança:**
  * *Isolamento de Rede:* O PostgreSQL é configurado no `postgresql.conf` e `pg_hba.conf` para escutar exclusivamente em `127.0.0.1` (`localhost`), impedindo acessos externos pela rede local.
  * *Controle de Acesso ao Sistema:* A aplicação roda sob usuário padrão do sistema operacional, sem permissões de `root`.
  * *Credenciais Sensíveis:* Isolamento das chaves JWT e acessos SMTP no arquivo `.env` (ignorado pelo versionamento Git através do `.gitignore`).

---

### ADR 08: Integridade de Dados, Cálculo Autoritativo e Desativação Lógica (Soft Delete)
* **Status:** Aprovado
* **Contexto:** Prevenir fraudes no fechamento de pedidos (RF04, RF05), evitar falhas de integridade referencial na exclusão de produtos com histórico de vendas e assegurar a captura correta de erros assíncronos no Express.
* **Decisão:**
  1. *Desativação Lógica (Soft Delete):* O endpoint `DELETE /api/produtos/:id` executa uma atualização lógica (`UPDATE produtos SET ativo = FALSE`), preservando as chaves estrangeiras vinculadas à tabela `itens_pedido`.
  2. *Cálculo Autoritativo no Back-end:* A rota `POST /api/pedidos` ignora quaisquer valores financeiros enviados pelo front-end. O serviço `order.service.js` busca os preços oficiais na tabela `produtos`, calcula os subtotais/total e persiste a transação.
  3. *Congelamento de Preço Unitário:* A tabela `itens_pedido` armazena a coluna `preco_unitario` no momento da compra, garantindo a imutabilidade do faturamento histórico frente a reajustes futuros no catálogo.
  4. *Obrigatoriedade de Contato:* A tabela `usuarios` aplica a restrição `CHECK (perfil != 'PRODUTOR' OR telefone IS NOT NULL)` para assegurar o funcionamento do link de contato no comprovante.
  5. *Tratamento de Exceções Assíncronas:* Adoção da função utilitária `asyncHandler` no Express 4 para encapsular controladores e repassar erros assíncronos de forma padronizada ao middleware `errorHandler`.
* **Rastreabilidade:** Atende a RF01, RF04, RF05, RF08, RN02, RN03, RN05, RNF01 e RNF02 (FEAT-02, FEAT-04 e FEAT-07).
* **Alternativas Rejeitadas:** Deleção física (`DELETE FROM produtos`) e cálculo de totais confiando nos dados enviados pelo cliente HTTP.
* **Trade-offs:** As consultas de catálogo público devem incluir explicitamente o filtro `WHERE ativo = TRUE`.

```javascript
// Utilitário de captura assíncrona para controladores do Express 4
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```