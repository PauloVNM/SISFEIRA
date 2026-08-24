# Features: SISFEIRA

## 1. Mapeamento de Módulos (Modules Registry)

| Módulo | Identificador | Responsabilidade do Negócio |
| :--- | :--- | :--- |
| **Autenticação e Usuários** | `auth` | Cadastro, identificação e controle de acesso de clientes, produtores e organização[cite: 1]. |
| **Catálogo e Produtos** | `catalog` | Cadastro, edição e disponibilização de produtos ofertados por semana/edição da feira[cite: 1]. |
| **Carrinho de Compras** | `cart` | Seleção temporária de itens, controle de quantidades e preparação da compra pelo cliente[cite: 1]. |
| **Logística e Retirada** | `delivery-point` | Configuração, seleção e exibição de pontos físicos de retirada/entrega dos pedidos[cite: 1]. |
| **Gestão de Pedidos** | `order` | Fechamento de compras, emissão de comprovantes, histórico e evolução do status (`recebido`, `em preparação`, `entregue`)[cite: 1]. |
| **Notificações** | `notification` | Disparo e visualização de alertas aos produtores sobre novos pedidos confirmados[cite: 1]. |
| **Relatórios de Vendas** | `report` | Consolidação e exibição métrica de vendas e itens faturados por produtor[cite: 1]. |

---

## 2. Backlog Detalhado de Features (Feature Backlog)

### FEAT-01: Cadastro e Autenticação de Usuários
* **Mapeamento de Requisitos:** RF01 (cadastro do produtor)[cite: 1], RF02 (cadastro do cliente)[cite: 1], RNF02 (segurança de dados)[cite: 1], RNF05 (responsividade)[cite: 1].
* **Módulos Afetados:** `auth`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Usuário acessa o sistema e solicita cadastro ou autenticação como cliente ou produtor[cite: 1].
  * **Critério de Aceite (Definition of Done):** Clientes e produtores conseguem criar contas, autenticar-se com segurança e acessar suas respectivas áreas com sessões ativas e dados protegidos[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabelas `usuarios`, `perfis` (ou segmentação `clientes`, `produtores`)[cite: 1].
  * **Back-end (API REST):** Rotas `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`[cite: 1].
  * **Front-end:** Tela `Login/Cadastro`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-01-auth-users`
  * **Commits Atômicos:**
    * `feat(auth): create user and profile database schema`
    * `feat(auth): implement registration and authentication endpoints`
    * `feat(frontend): build responsive login and registration interface`

---

### FEAT-02: Gestão de Produtos e Catálogo Semanal
* **Mapeamento de Requisitos:** RF01 (cadastro de produtos)[cite: 1], RF03 (catálogo semanal)[cite: 1], RNF01 (desempenho $\le$ 2s)[cite: 1], RNF05 (responsividade)[cite: 1], RNF07 (gestão sem programação)[cite: 1], RN01 (temporalidade da feira)[cite: 1], RN07 (autonomia administrativa)[cite: 1].
* **Módulos Afetados:** `catalog`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Produtor acessa o painel para cadastrar/editar produtos ou cliente abre a página inicial da feira para visualizar os itens disponíveis[cite: 1].
  * **Critério de Aceite (Definition of Done):** Produtor cadastra e edita seus produtos via interface gráfica de forma autônoma[cite: 1]; catálogo semanal carrega em até 2 segundos em dispositivos móveis[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabelas `produtos`, `edicoes_feira`[cite: 1].
  * **Back-end (API REST):** Rotas `GET /api/catalogo`, `POST /api/produtos`, `PUT /api/produtos/:id`, `DELETE /api/produtos/:id`, `GET /api/produtos/produtor`[cite: 1].
  * **Front-end:** Telas `Catálogo de produtos`, `Painel do produtor`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-02-catalog-products`
  * **Commits Atômicos:**
    * `feat(catalog): create product and edition database entities`
    * `feat(catalog): implement CRUD endpoints for producer products`
    * `feat(catalog): implement public weekly catalog listing endpoint`
    * `feat(frontend): build producer product management view`
    * `feat(frontend): build customer weekly catalog browsing view`

---

### FEAT-03: Carrinho de Compras e Seleção de Ponto de Retirada
* **Mapeamento de Requisitos:** RF04 (carrinho de compras)[cite: 1], RF10 (ponto de retirada/entrega)[cite: 1], RNF03 (usabilidade simples)[cite: 1], RNF05 (responsividade)[cite: 1], RN05 (obrigatoriedade do ponto de atendimento)[cite: 1].
* **Módulos Afetados:** `cart`, `delivery-point`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Cliente adiciona o primeiro item ao carrinho a partir do catálogo[cite: 1].
  * **Critério de Aceite (Definition of Done):** Itens podem ser inseridos, incrementados, decrementados e removidos do carrinho, com o ponto de entrega/retirada devidamente selecionado antes do checkout[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabela `pontos_retirada`[cite: 1].
  * **Back-end (API REST):** Rotas `GET /api/pontos-retirada`, `POST /api/pontos-retirada`[cite: 1].
  * **Front-end:** Telas `Catálogo de produtos`, `Carrinho de compras`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-03-cart-delivery-point`
  * **Commits Atômicos:**
    * `feat(delivery): create delivery points table and query endpoint`
    * `feat(cart): implement client-side shopping cart state management`
    * `feat(frontend): build shopping cart view with delivery point selection`

---

### FEAT-04: Confirmação de Pedido e Emissão de Comprovante
* **Mapeamento de Requisitos:** RF05 (confirmação e comprovante)[cite: 1], RNF02 (segurança)[cite: 1], RNF03 (usabilidade)[cite: 1], RN03 (emissão de comprovante)[cite: 1], RN05 (ponto de atendimento)[cite: 1].
* **Módulos Afetados:** `order`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Cliente clica em "Confirmar Pedido" após revisar carrinho e ponto de retirada[cite: 1].
  * **Critério de Aceite (Definition of Done):** Pedido é registrado no banco de dados com status inicial `recebido` e um comprovante detalhado com identificador único é gerado e disponibilizado para visualização/impressão[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabelas `pedidos`, `itens_pedido`[cite: 1].
  * **Back-end (API REST):** Rotas `POST /api/pedidos`, `GET /api/pedidos/:id/comprovante`[cite: 1].
  * **Front-end:** Tela `Confirmação de pedido`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-04-order-checkout-receipt`
  * **Commits Atômicos:**
    * `feat(order): create order and order items database schema`
    * `feat(order): implement order checkout and receipt retrieval endpoints`
    * `feat(frontend): build order confirmation and receipt display view`

---

### FEAT-05: Notificações de Novos Pedidos para Produtores
* **Mapeamento de Requisitos:** RF09 (notificar produtor)[cite: 1], RNF04 (disponibilidade)[cite: 1], RN04 (alerta imediato)[cite: 1].
* **Módulos Afetados:** `notification`, `order`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Um novo pedido é concluído com sucesso por um cliente[cite: 1].
  * **Critério de Aceite (Definition of Done):** Cada produtor que possuir itens vinculados ao novo pedido recebe um alerta/notificação visível em seu painel[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabela `notificacoes`[cite: 1].
  * **Back-end (API REST):** Serviço de despacho de notificações e rota `GET /api/notificacoes/produtor`[cite: 1].
  * **Front-end:** Tela `Painel do produtor` (área de avisos/notificações)[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-05-order-notifications`
  * **Commits Atômicos:**
    * `feat(notification): create notifications schema and event trigger`
    * `feat(notification): implement endpoint to fetch producer notifications`
    * `feat(frontend): display new order notification alerts on producer dashboard`

---

### FEAT-06: Acompanhamento de Pedidos e Gestão de Status
* **Mapeamento de Requisitos:** RF06 (gerenciar status)[cite: 1], RF07 (histórico de pedidos)[cite: 1], RNF03 (usabilidade)[cite: 1], RNF04 (disponibilidade)[cite: 1], RN02 (ciclo de vida formal dos pedidos)[cite: 1].
* **Módulos Afetados:** `order`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Produtor altera o status do pedido no painel ou cliente acessa a consulta de status/histórico[cite: 1].
  * **Critério de Aceite (Definition of Done):** O produtor atualiza o status do pedido via painel (`recebido` $\rightarrow$ `em preparação` $\rightarrow$ `entregue`) e o cliente visualiza a situação atualizada do pedido sob demanda ao consultar seu histórico, acessar a página de acompanhamento ou simplesmente ao atualizar a página[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Tabela `pedidos` (coluna `status` e timestamps de transição)[cite: 1].
  * **Back-end (API REST):** Rotas `PATCH /api/pedidos/:id/status`, `GET /api/pedidos/historico`, `GET /api/pedidos/produtor`[cite: 1].
  * **Front-end:** Telas `Status do pedido`, `Painel do produtor`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-06-order-status-history`
  * **Commits Atômicos:**
    * `feat(order): implement order status transition endpoint with validation`
    * `feat(order): implement customer order history endpoint`
    * `feat(frontend): build order tracking and status view for customers`
    * `feat(frontend): build order status management controls in producer panel`

---

### FEAT-07: Relatórios de Vendas por Produtor
* **Mapeamento de Requisitos:** RF08 (relatório de vendas)[cite: 1], RNF02 (segurança)[cite: 1], RN06 (isolamento dos relatórios de produtor)[cite: 1].
* **Módulos Afetados:** `report`
* **Limites de Escopo:**
  * **Gatilho de Início (Trigger):** Produtor acessa a seção de relatórios no painel de controle[cite: 1].
  * **Critério de Aceite (Definition of Done):** Relatório consolida métricas de quantidade vendida, total faturado e itens mais demandados, exibindo exclusivamente os dados pertencentes ao produtor autenticado[cite: 1].
* **Raio de Impacto:**
  * **Banco de Dados:** Consultas analíticas sobre as tabelas `pedidos`, `itens_pedido` e `produtos`[cite: 1].
  * **Back-end (API REST):** Rota `GET /api/relatorios/vendas/produtor`[cite: 1].
  * **Front-end:** Tela `Relatórios de vendas`[cite: 1].
* **Diretrizes Git:**
  * **Branch:** `feature/FEAT-07-sales-reports`
  * **Commits Atômicos:**
    * `feat(report): implement sales aggregation query and report endpoint`
    * `feat(frontend): build producer sales report view with metrics summary`