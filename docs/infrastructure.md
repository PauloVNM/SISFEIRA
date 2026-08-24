# Infrastructure: SISFEIRA

## 1. Tipo de Ambiente (Environment)

* **Modelo Operacional:** Host Único Bare-Metal (execução direta no sistema operacional)[cite: 1].
* **Propósito:** Ambiente dedicado de desenvolvimento, homologação e execução demonstrativa do projeto acadêmico SISFEIRA[cite: 1].
* **Estratégia de Isolamento:** Sem uso de contêineres (Docker) ou máquinas virtuais; os serviços do SGBD (PostgreSQL) e da aplicação (Node.js/Express) rodam nativamente na mesma máquina, comunicando-se via loopback local (`127.0.0.1` / sockets de domínio Unix)[cite: 1].

---

## 2. Especificações de Hardware Recomendadas (Hardware Specs)

Para execução estável do sistema web com SGBD integrado atendendo aos requisitos de tempo de resposta ($\le$ 2s)[cite: 1] e picos em dias de feira (RNF01, RNF04, RNF06)[cite: 1]:

| Recurso | Requisito Mínimo | Recomendado | Finalidade |
| :--- | :--- | :--- | :--- |
| **Processador (CPU)** | 1 núcleo (x86_64) | 2 núcleos ou mais | Processamento de requisições HTTP assíncronas no Node.js e queries de agregação no PostgreSQL[cite: 1]. |
| **Memória RAM** | 1 GB | 2 GB a 4 GB | Alocação compartilhada: ~150 MB (Node.js runtime) + ~250 MB (PostgreSQL buffer/pool) + Sistema Operacional. |
| **Armazenamento** | 5 GB livre (SSD/NVMe) | 10 GB livre (SSD) | Instalação do Debian, dependências `node_modules`, arquivos estáticos e banco de dados relacional[cite: 1]. |
| **Rede** | 10/100 Mbps Ethernet / Wi-Fi | 1 Gbps Ethernet | Interface local para comunicação interna e atendimento de requisições web responsivas[cite: 1]. |

---

## 3. Software do Sistema (System Software)

| Componente | Especificação / Versão | Função no Sistema |
| :--- | :--- | :--- |
| **Sistema Operacional** | Debian GNU/Linux 11 (Bullseye) ou 12 (Bookworm) | Sistema base de execução e gerenciamento de processos. |
| **Runtime Back-end** | Node.js (LTS v18 ou v20) com `npm` | Execução do servidor Express e processamento da lógica de negócio e API REST[cite: 1]. |
| **SGBD** | PostgreSQL 15+ | Instância nativa gerenciada pelo gerenciador de serviços do sistema (`systemd`), operando na porta `5432`[cite: 1]. |
| **Servidor HTTP** | Express.js (`express.static`) | Entrega conjunta de páginas web estáticas (HTML/CSS/JS) e rotas da API REST sob a porta `3000`[cite: 1]. |
| **Controle de Versão** | Git 2.30+ | Controle de versão do código-fonte e automação de atualizações. |

---

## 4. Fluxo de Execução Local (Local Execution Flow)

Para executar o sistema localmente no terminal Debian/Linux:

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Inicializar o Banco de Dados (PostgreSQL):**
   * Criar o banco e aplicar o schema com os dados iniciais via `psql`:
   ```bash
   psql -U postgres -d sisfeira_db -f src/database/schema.sql
   ```

3. **Configurar o Ambiente:**
   * Copiar o modelo de configuração e ajustar as credenciais:
   ```bash
   cp .env.example .env
   ```

4. **Iniciar o Servidor:**
   ```bash
   npm start
   ```
   * A aplicação ficará acessível no navegador em `http://localhost:3000`.

---

## 5. Variáveis de Ambiente (Environment Variables)

Configurações centralizadas no arquivo `.env` na raiz do projeto, documentadas pelo modelo `.env.example`:

| Variável | Tipo | Descrição | Exemplo de Valor (Não sensível) |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | Ambiente de execução (`development`, `production`, `test`) | `development` |
| `PORT` | Number | Porta HTTP em que a aplicação Node.js responderá | `3000` |
| `DB_HOST` | String | Endereço do host do banco PostgreSQL | `127.0.0.1` |
| `DB_PORT` | Number | Porta de conexão com o PostgreSQL | `5432` |
| `DB_NAME` | String | Nome do banco de dados relacional | `sisfeira_db` |
| `DB_USER` | String | Usuário com permissões no banco do SISFEIRA | `sisfeira_user` |
| `DB_PASS` | String | Senha de acesso ao banco (segredo local) | `********` |
| `JWT_SECRET` | String | Chave criptográfica para assinatura de tokens JWT | `********` |
| `JWT_EXPIRES_IN` | String | Tempo de expiração dos tokens emitidos | `8h` |
| `SMTP_HOST` | String | Servidor SMTP para disparo de e-mails transacionais | `smtp.exemplo.com` |
| `SMTP_PORT` | Number | Porta de comunicação TLS/STARTTLS do SMTP | `587` |
| `SMTP_USER` | String | Usuário de autenticação do e-mail de notificações | `notificacoes@sisfeira.local` |
| `SMTP_PASS` | String | Senha de autenticação do e-mail | `********` |

---

## 6. Logs e Monitoramento (Logs and Monitoring)

* **Logs da Aplicação Node.js:**
  * Saídas padrão (`stdout` para requisições e `stderr` para erros capturados) exibidas diretamente no terminal de execução ou no console do processo.
* **Logs do Banco de Dados (PostgreSQL):**
  * Registros de integridade e consultas armazenados nativamente no Debian:
    ```bash
    tail -f /var/log/postgresql/postgresql-*-main.log
    ```
* **Checagem de Status (Health Check):**
  * Endpoint leve `GET /api/health` para validar se o servidor HTTP e a conexão com o PostgreSQL estão operacionais.

---

## 7. Procedimento de Rollback (Rollback)

Caso seja necessário reverter o código para uma versão anterior estável, utilize os comandos convencionais do Git:

* **Para alternar temporariamente para um commit anterior:**
  ```bash
  git checkout <HASH_DO_COMMIT>
  ```
* **Para desfazer as alterações de um commit gerando um novo commit de reversão:**
  ```bash
  git revert <HASH_DO_COMMIT>
  ```

---

## 8. Segurança e Boas Práticas Operacionais

* **Permissões do Arquivo `.env`:** O arquivo de configuração local deve ter permissões restritas de leitura:
  ```bash
  chmod 600 .env
  ```
* **Execução sem Privilégios Root:** A aplicação Node.js deve ser iniciada pelo usuário padrão de desenvolvimento local no Linux, nunca como `root`.
* **Tratamento de Erros:** Em ambiente de produção (`NODE_ENV=production`), mensagens de erro capturadas não devem expor detalhes internos de queries SQL nas respostas JSON da API.