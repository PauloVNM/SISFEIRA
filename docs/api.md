# API Contract: SISFEIRA

## 1. Visão Geral (Overview)

A API REST do **SISFEIRA** é a interface centralizada para todas as operações de clientes, produtores e organização da feira[cite: 1].

* **URL Base:** `http://localhost:3000/api`
* **Protocolo de Comunicação:** HTTP/1.1 RESTful[cite: 1]
* **Formato de Dados:** `application/json` (para payloads de envio e retorno)
* **Padrão de Resposta:** Todas as respostas utilizam os códigos de status HTTP convencionais acompanhados de corpos JSON padronizados.

---

## 2. Autenticação e Autorização (Authentication)

O acesso às rotas restritas é controlado via **JSON Web Tokens (JWT)** com modelo **RBAC (Role-Based Access Control)**[cite: 1].

* **Formato do Cabeçalho:** `Authorization: Bearer <token_jwt>`
* **Perfis Permitidos (Roles):** `CLIENTE`, `PRODUTOR`, `ORGANIZACAO`[cite: 1].
* **Expiração do Token:** Padrão de 8 horas por sessão emitida.

### 2.1 Diagrama do Fluxo de Autenticação

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário (Cliente/Produtor)
    participant Client as Front-end (Vanilla JS)
    participant API as Back-end Express (/api/auth)
    participant DB as PostgreSQL

    User->>Client: Informa e-mail e senha
    Client->>API: POST /api/auth/login { email, senha }
    API->>DB: SELECT * FROM usuarios WHERE email = $1
    DB-->>API: Retorna registro com senha_hash e perfil
    API->>API: Valida senha com bcrypt.compare()
    
    alt Credenciais Inválidas
        API-->>Client: 401 Unauthorized { erro: true, mensagem: "Credenciais inválidas" }
    else Credenciais Corretas
        API->>API: Gera JWT assinado (payload: { id, nome, perfil })
        API-->>Client: 200 OK { token, usuario: { id, nome, perfil } }
        Client->>Client: Armazena token no localStorage
    end
    
    Note over Client,API: Requisição subsequente autenticada
    Client->>API: GET /api/pedidos/historico (Header: Authorization: Bearer <token>)
    API->>API: Middleware verifyToken valida assinatura e expiração
    API-->>Client: 200 OK [ Lista de pedidos do usuário ]
```

---

## 3. Endpoints Públicos (Endpoints Public)

Rotas de livre acesso que não demandam token de autorização.

### 3.1 `POST /api/auth/cadastro`
* **Descrição:** Cadastra um novo cliente ou produtor no sistema (RF01, RF02)[cite: 1].
* **Corpo da Requisição (Body):**
  ```json
  {
    "nome": "Maria Ferreira",
    "email": "maria@exemplo.com",
    "senha": "senhaSegura123",
    "telefone": "92991234567",
    "perfil": "CLIENTE"
  }
  ```
* **Respostas:**
  * `201 Created`: `{ "mensagem": "Usuário cadastrado com sucesso", "id": "uuid-gerado" }`
  * `400 Bad Request`: Dados obrigatórios ausentes ou inválidos.
  * `409 Conflict`: E-mail já registrado.

### 3.2 `POST /api/auth/login`
* **Descrição:** Autentica o usuário e emite o token de sessão JWT[cite: 1].
* **Corpo da Requisição (Body):**
  ```json
  {
    "email": "maria@exemplo.com",
    "senha": "senhaSegura123"
  }
  ```
* **Respostas:**
  * `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usuario": {
        "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
        "nome": "Maria Ferreira",
        "perfil": "CLIENTE"
      }
    }
    ```
  * `401 Unauthorized`: Credenciais incorretas.

### 3.3 `GET /api/catalogo`
* **Descrição:** Lista todos os produtos disponíveis na edição ativa da feira com tempo de resposta $\le$ 2s (RF03, RNF01)[cite: 1].
* **Respostas:**
  * `200 OK`:
    ```json
    [
      {
        "id": "prod-111",
        "nome": "Farinha de Uarini",
        "descricao": "Farinha ovinha crocante artesanal",
        "preco": 14.50,
        "unidade_medida": "kg",
        "produtor": {
          "id": "produtor-01",
          "nome": "Seu Manoel"
        }
      }
    ]
    ```

### 3.4 `GET /api/pontos-retirada`
* **Descrição:** Lista os pontos físicos de logística cadastrados para a feira (RF10)[cite: 1].
* **Respostas:**
  * `200 OK`:
    ```json
    [
      {
        "id": "ponto-01",
        "nome": "Tenda Principal - Praça da Feira",
        "endereco": "Av. Brasil, s/n - Centro",
        "instrucoes": "Retiradas das 07h às 12h"
      }
    ]
    ```

### 3.5 `GET /api/health`
* **Descrição:** Checagem de disponibilidade do servidor e conexão com o PostgreSQL.
* **Respostas:**
  * `200 OK`: `{ "status": "UP", "database": "connected" }`

---

## 4. Endpoints Restritos (Endpoints Protected)

Requerem o envio do token no cabeçalho `Authorization: Bearer <token>`.

### 4.1 Área do Cliente (`perfil: CLIENTE`)

#### `POST /api/pedidos`
* **Descrição:** Fecha o carrinho de compras, cria o pedido e gera o comprovante (RF04, RF05, RF10)[cite: 1].
* **Corpo da Requisição (Body):**
  ```json
  {
    "ponto_retirada_id": "ponto-01",
    "itens": [
      { "produto_id": "prod-111", "quantidade": 2 },
      { "produto_id": "prod-222", "quantidade": 1 }
    ]
  }
  ```
* **Respostas:**
  * `201 Created`:
    ```json
    {
      "pedido_id": "ped-9876",
      "comprovante_codigo": "COMP-2026-9876",
      "status": "RECEBIDO",
      "valor_total": 45.00,
      "criado_em": "2026-08-24T10:00:00Z"
    }
    ```

#### `GET /api/pedidos/historico`
* **Descrição:** Retorna os pedidos anteriores do cliente autenticado (RF07)[cite: 1].
* **Respostas:**
  * `200 OK`: Lista resumida de pedidos vinculados ao `cliente_id` extraído do token.

#### `GET /api/pedidos/:id/comprovante`
* **Descrição:** Retorna o espelho detalhado do comprovante do pedido com dados para contato (RF05)[cite: 1].
* **Respostas:**
  * `200 OK`: Dados completos do pedido, itens, ponto de retirada e telefone dos produtores para montagem do link `wa.me`.

---

### 4.2 Área do Produtor (`perfil: PRODUTOR`)

#### `GET /api/produtos/produtor`
* **Descrição:** Retorna a lista de produtos cadastrados pelo produtor autenticado (RF01)[cite: 1].
* **Respostas:** `200 OK` com array de produtos do próprio feirante.

#### `POST /api/produtos`
* **Descrição:** Cadastra um novo produto no catálogo (RF01, RNF07)[cite: 1].
* **Corpo da Requisição (Body):**
  ```json
  {
    "nome": "Tucumã Descascado",
    "descricao": "Pacote de 500g fresco",
    "preco": 20.00,
    "unidade_medida": "pacote"
  }
  ```
* **Respostas:** `201 Created` `{ "id": "prod-333", "mensagem": "Produto criado" }`

#### `PUT /api/produtos/:id`
* **Descrição:** Atualiza os dados de um produto pertencente ao produtor autenticado (RF01, RNF07)[cite: 1].

#### `DELETE /api/produtos/:id`
* **Descrição:** Remove um produto do catálogo do produtor autenticado (RF01)[cite: 1].

#### `GET /api/pedidos/produtor`
* **Descrição:** Lista as encomendas da feira que contêm itens do produtor autenticado (RF06)[cite: 1].

#### `PATCH /api/pedidos/:id/status`
* **Descrição:** Atualiza a situação de atendimento do pedido (RF06, RN02)[cite: 1].
* **Corpo da Requisição (Body):**
  ```json
  {
    "status": "EM_PREPARACAO"
  }
  ```
* **Valores aceitos:** `RECEBIDO`, `EM_PREPARACAO`, `ENTREGUE`[cite: 1].
* **Respostas:** `200 OK` `{ "mensagem": "Status atualizado com sucesso" }`

#### `GET /api/notificacoes/produtor`
* **Descrição:** Retorna as notificações pendentes de novos pedidos recebidos (RF09, RN04)[cite: 1].
* **Respostas:** `200 OK` com array de notificações persistidas.

#### `GET /api/relatorios/vendas/produtor`
* **Descrição:** Gera o relatório consolidado de vendas do produtor autenticado (RF08, RN06)[cite: 1].
* **Respostas:**
  * `200 OK`:
    ```json
    {
      "total_faturado": 1250.00,
      "total_pedidos": 28,
      "itens_mais_vendidos": [
        { "produto_nome": "Farinha de Uarini", "quantidade_vendida": 40, "subtotal": 580.00 }
      ]
    }
    ```

---

### 4.3 Área da Organização (`perfil: ORGANIZACAO`)

* `POST /api/edicoes`: Cria e ativa uma nova edição da feira[cite: 1].
* `POST /api/pontos-retirada`: Cadastra novos locais físicos de entrega/retirada (RF10)[cite: 1].

---

## 5. Padrão de Erros (Errors)

Quando uma requisição não é concluída com sucesso, a API responde com um código HTTP adequado e um payload estruturado:

```json
{
  "erro": true,
  "mensagem": "Descrição clara e legível sobre o motivo do erro",
  "codigo": "CATEGORIA_DO_ERRO"
}
```

### 5.1 Tabela de Códigos HTTP Comuns

| Código HTTP | Significado | Quando é Utilizado |
| :--- | :--- | :--- |
| `400 Bad Request` | Parâmetros Inválidos | Dados obrigatórios ausentes ou formato incorreto no corpo JSON. |
| `401 Unauthorized` | Não Autenticado | Token JWT ausente, expirado ou com assinatura inválida. |
| `403 Forbidden` | Não Autorizado | Usuário autenticado tentando acessar recurso de outro papel ou outro feirante (RN06)[cite: 1]. |
| `404 Not Found` | Não Encontrado | Recurso (produto, pedido ou ponto) não existe no banco de dados. |
| `409 Conflict` | Conflito de Integridade | Tentativa de cadastrar e-mail duplicado ou violação de chave única. |
| `500 Internal Server Error` | Erro no Servidor | Falha não tratada de conexão ou execução interna (detalhes omitidos em produção). |

---

## 6. Exemplos Práticos de Chamadas (Examples)

### Exemplo 1: Autenticação do Feirante
**Requisição:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "produtor.manoel@sisfeira.local",
  "senha": "senhaSeguraFeira123"
}
```

**Resposta:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhMmIzYzRkIiwicGVyZmlsIjoiUFJPRFVUT1IifQ...",
  "usuario": {
    "id": "1a2b3c4d-5e6f-7a8b-9c0d-ef1234567890",
    "nome": "Manoel Feirante",
    "perfil": "PRODUTOR"
  }
}
```

---

### Exemplo 2: Fechamento de Pedido pelo Cliente
**Requisição:**
```http
POST /api/pedidos HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "ponto_retirada_id": "c1d2e3f4-0000-1111-2222-333344445555",
  "itens": [
    { "produto_id": "p1111111-2222-3333-4444-555566667777", "quantidade": 2 }
  ]
}
```

**Resposta:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "pedido_id": "8f7e6d5c-4b3a-2109-8765-4321fedcba98",
  "comprovante_codigo": "SISF-2026-0042",
  "status": "RECEBIDO",
  "valor_total": 29.00,
  "criado_em": "2026-08-24T10:15:00.000Z"
}
```

---

### Exemplo 3: Produtor Atualiza Status da Encomenda
**Requisição:**
```http
PATCH /api/pedidos/8f7e6d5c-4b3a-2109-8765-4321fedcba98/status HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "EM_PREPARACAO"
}
```

**Resposta:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sucesso": true,
  "mensagem": "Status do pedido alterado para EM_PREPARACAO com sucesso."
}
```