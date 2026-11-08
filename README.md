# OrquestraCompras — Etapa 01

Base de desenvolvimento da plataforma de apoio à decisão de compras de tecnologia. Esta etapa cria as unidades independentes e disponibiliza somente health checks; CRUDs, autenticação, filas, agregação e acesso a bancos ainda não foram implementados.

## Estrutura

```text
frontend/       Web Shell e microfrontends React/Vite independentes
bff/            Entrada HTTP pública (Express)
services/       Identity e Budget com camadas Clean Architecture
functions/      Espaço reservado ao Monitoring Service existente/futuro
docs/           Decisões e documentação complementar
```

## Pré-requisitos

Node.js 20+ e npm 10+. Copie cada `.env.example` para `.env` antes de configurar integrações reais. Nenhuma variável de exemplo contém segredo.

## Executar

Em terminais separados:

```powershell
cd bff; npm run dev
cd services/identity-service; npm run dev
cd services/budget-service; npm run dev
cd frontend/web-shell; npm run dev
cd frontend/mfe-conta; npm run dev
cd frontend/mfe-orcamentos; npm run dev
```

Os backends usam, por padrão, as portas 3000, 3001 e 3002. A interface deve consumir o BFF quando os fluxos de negócio forem implementados; ela não deve chamar os microsserviços diretamente.

## Endpoints da etapa

| Unidade | Health | OpenAPI UI |
| --- | --- | --- |
| BFF | `GET /health` | `GET /api-docs` |
| Identity | `GET /health` | `GET /api-docs` |
| Budget | `GET /health` | `GET /api-docs` |

O `/health` apenas confirma que o processo HTTP está ativo, sem tentar conectar a MongoDB Atlas ou Azure SQL. As variáveis de integração foram documentadas para a próxima etapa.

## Verificação

Cada backend possui `npm test` para o endpoint de saúde e `npm run build`, que valida a sintaxe dos arquivos de produção. Cada frontend possui builds Vite independentes.

Consulte [docs/arquitetura-etapa-01.md](docs/arquitetura-etapa-01.md) para as decisões aplicadas nesta fundação.

