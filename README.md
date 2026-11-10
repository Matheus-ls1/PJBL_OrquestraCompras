# OrquestraCompras

**Projeto acadêmico --- Arquitetura Cloud \| Engenharia de Software**

**Integrantes:** Angely Zambrano, Lucas Moro e Matheus Lucas.

## 1. Descrição do projeto

O **OrquestraCompras** é uma aplicação para apoiar o planejamento de
compras. O usuário pode organizar orçamentos, definir um limite
financeiro, cadastrar itens desejados e lojas autorizadas, além de
acompanhar o estado de seus projetos de compra. A arquitetura prevê
monitoramento de oportunidades e análises de apoio à decisão, com
integração assíncrona entre serviços.

## 2. Descrição da arquitetura

O sistema utiliza uma **arquitetura distribuída baseada em
microfrontends, BFF, microsserviços e processamento orientado a
eventos**. Os componentes têm responsabilidades separadas, permitindo
manutenção e publicação independentes.

``` text
Usuário (navegador)
        |
        v
Web Shell (React/Vite)
   |              |
   v              v
MFE Conta     MFE Orçamentos
        \      /
         v    v
       BFF (Node.js/Express)
        |                |
        v                v
 Identity Service    Budget Service
        |                |
        v                v
  MongoDB Atlas       Azure SQL
                         |
                    Outbox (eventos)
                         |
                         v
                  Azure Storage Queue
                         |
                         v
              Monitoring Service
               (Azure Functions)
                         |
                         v
                   MongoDB Atlas
```

**Componentes principais:**

-   **Web Shell:** aplicação que integra os microfrontends e organiza a
    navegação.
-   **MFE Conta:** interface das funcionalidades de cadastro,
    autenticação e gerenciamento de conta.
-   **MFE Orçamentos:** interface para criação, edição e acompanhamento
    dos orçamentos.
-   **BFF (Backend for Frontend):** camada de comunicação entre as
    interfaces e os serviços, incluindo agregação e encaminhamento de
    requisições.
-   **Identity Service:** serviço responsável por usuários, autenticação
    com JWT e gerenciamento da conta; utiliza MongoDB Atlas.
-   **Budget Service:** serviço responsável pelos orçamentos, itens,
    lojas e estados; utiliza Azure SQL, auditoria e padrão Transactional
    Outbox.
-   **Monitoring Service:** processamento de eventos e funcionalidades
    de monitoramento por meio de Azure Functions, Azure Storage Queues e
    persistência própria.

O backend segue princípios de **Clean Architecture**, separação de
responsabilidades e organização por funcionalidades (*Vertical Slice*).
A comunicação assíncrona usa eventos e mecanismos de idempotência para
reduzir o acoplamento entre serviços.

## 3. Tecnologias utilizadas

  -----------------------------------------------------------------------
  Camada                              Tecnologias
  ----------------------------------- -----------------------------------
  Interface web                       React, JavaScript, Vite, HTML e CSS

  BFF e APIs                          Node.js, Express, APIs REST, JSON e
                                      Swagger/OpenAPI

  Autenticação                        JWT e bcrypt

  Persistência de identidade e        MongoDB Atlas
  monitoramento                       

  Persistência de orçamentos          Microsoft Azure SQL Database

  Mensageria                          Azure Storage Queues e padrão
                                      Transactional Outbox

  Processamento serverless            Azure Functions

  Infraestrutura                      Microsoft Azure, Azure Container
                                      Apps e Docker

  Práticas de arquitetura             Microfrontends, microsserviços,
                                      Clean Architecture e Event-Driven
                                      Architecture
  -----------------------------------------------------------------------

## 4. Como executar localmente

### 4.1 Pré-requisitos

-   Node.js e npm compatíveis com os projetos;
-   Git;
-   Docker, quando necessário para dependências locais;
-   Azure Functions Core Tools para o Monitoring Service;
-   Acesso autorizado ao MongoDB Atlas e ao Azure SQL;
-   Azure CLI (`az login`) caso a conexão local com Azure SQL utilize
    Microsoft Entra ID;
-   Azurite ou uma conta de Azure Storage para o processamento local das
    filas.

### 4.2 Configuração

1.  Clone o repositório e localize as pastas de cada módulo
    (`web-shell`, `mfe-conta`, `mfe-orcamentos`, `bff`,
    `identity-service`, `budget-service` e `monitoring-service`). Os
    diretórios podem estar agrupados em subpastas, conforme a
    organização do repositório.
2.  Em cada projeto Node.js, instale as dependências com `npm install`.
3.  Configure os arquivos de ambiente conforme os exemplos e as
    instruções do respectivo módulo. **Não publique senhas, tokens,
    strings de conexão ou arquivos `.env`/`local.settings.json` com
    segredos.**
4.  Inicialize os bancos, filas e serviços necessários antes de executar
    os módulos dependentes.

### 4.3 Iniciar os módulos

Execute os comandos a seguir **dentro da pasta de cada módulo**:

  Módulo               Comandos usuais
  -------------------- ----------------------------------------------
  Web Shell            `npm install` e `npm run dev`
  MFE Conta            `npm install` e `npm run dev`
  MFE Orçamentos       `npm install` e `npm run dev`
  BFF                  `npm install` e `npm run dev` ou `npm start`
  Identity Service     `npm install` e `npm run dev` ou `npm start`
  Budget Service       `npm install` e `npm run dev` ou `npm start`
  Monitoring Service   `npm install` e `func start`

> **Observação:** confira `scripts` no `package.json` de cada módulo
> antes de executar os comandos. As portas, variáveis e caminhos exatos
> devem seguir a configuração do repositório.

### 4.4 Dependências específicas

**Identity Service:** requer conexão válida com MongoDB Atlas e
configuração de autenticação JWT.

**Budget Service:** requer acesso ao banco Azure SQL e configuração das
variáveis de conexão, incluindo `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`
e `AZURE_SQL_AUTHENTICATION`. Na autenticação local por Entra ID, faça
`az login` com uma conta autorizada no banco.

**Monitoring Service:** requer configurações do Azure Functions,
armazenamento para filas e, quando utilizado localmente, Azurite. O
arquivo `local.settings.json` deve permanecer fora do controle de versão
caso contenha credenciais.

## 5. Aplicação publicada na nuvem

**Budget Service --- API de orçamentos (Azure Container Apps):**

https://orquestracompras-budget.blackbeach-dd42c837.brazilsouth.azurecontainerapps.io

**Endpoint de verificação de execução (health):**

https://orquestracompras-budget.blackbeach-dd42c837.brazilsouth.azurecontainerapps.io/health

**Endpoint de verificação de dependências (readiness):**

https://orquestracompras-budget.blackbeach-dd42c837.brazilsouth.azurecontainerapps.io/readiness

A rota `/health` verifica se o serviço está respondendo; `/readiness`
depende também de suas integrações, como o banco de dados, e pode
indicar indisponibilidade quando uma dependência não estiver acessível.

**Importante:** o endereço acima corresponde à **API do Budget
Service**, não à interface web completa. Para a apresentação em vídeo,
demonstrar os endereços públicos efetivamente implantados na
internet/Azure, em vez de utilizar `localhost` como evidência de
publicação.

## 6. Organização dos projetos

  Projeto                Responsabilidade
  ---------------------- ------------------------------------------
  `web-shell`            Integração dos microfrontends
  `mfe-conta`            Interface de conta e autenticação
  `mfe-orcamentos`       Interface de gestão de orçamentos
  `bff`                  Integração frontend/backend
  `identity-service`     Identidade e autenticação
  `budget-service`       Orçamentos e persistência Azure SQL
  `monitoring-service`   Processamento de eventos e monitoramento

Cada projeto possui um `README.md` próprio com sua função, tecnologias,
execução local e informações de publicação disponíveis.

## 7. Integrantes

-   Angely Zambrano
-   Lucas Moro
-   Matheus Lucas
