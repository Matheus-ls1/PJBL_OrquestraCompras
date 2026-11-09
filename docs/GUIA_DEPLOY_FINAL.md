# Guia de deploy final — OrquestraCompras

Este guia prepara publicação; ele **não** cria recursos, publica imagens, aplica migrations ou altera bancos. Substitua todos os valores entre `<...>` fora do repositório, em secrets/configurações da plataforma.

## Imagens Docker Hub

As imagens Linux amd64 a publicar são `web-shell`, `mfe-conta`, `mfe-orcamentos`, `bff`, `identity-service` e `budget-service`. Execute, a partir da raiz do repositório, após `docker login`:

```bash
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-web-shell:<tag> --build-arg VITE_BFF_BASE_URL=https://<bff-publico> --build-arg VITE_MFE_CONTA_URL=https://<mfe-conta-publico>/remoteEntry.js --build-arg VITE_MFE_ORCAMENTOS_URL=https://<mfe-orcamentos-publico>/remoteEntry.js ./frontend/web-shell
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-mfe-conta:<tag> --build-arg VITE_BFF_BASE_URL=https://<bff-publico> ./frontend/mfe-conta
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-mfe-orcamentos:<tag> --build-arg VITE_BFF_BASE_URL=https://<bff-publico> ./frontend/mfe-orcamentos
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-bff:<tag> ./bff
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-identity:<tag> ./services/identity-service
docker buildx build --platform linux/amd64 --pull --push -t <dockerhub-user>/orquestracompras-budget:<tag> ./services/budget-service
```

`VITE_*` é compilada no bundle: mudar a variável em uma Container App já criada não muda o frontend. Reconstrua a imagem quando mudarem a URL do BFF ou de um remote. `remoteEntry.js` dos MFEs é servido com CORS para ativos estáticos, necessário à Federation; isso não abre CORS das APIs.

## Portas e health checks

| Componente | Porta do contêiner | Verificações |
|---|---:|---|
| Web Shell, MFE Conta, MFE Orçamentos | 80 | `GET /` |
| BFF | 3000 | `GET /health`, `GET /api-docs` |
| Identity | 3001 | `GET /health`, `GET /readiness`, `GET /api-docs` |
| Budget | 3002 | `GET /health`, `GET /readiness`, `GET /api-docs` |
| Monitoring Function | gerenciada pela Function App | `POST /api/v1/monitoramento/resumo-financeiro` e endpoints de oportunidades |

No Container Apps, configure `targetPort` para cada porta acima e deixe ingress público somente para Web Shell e BFF (e, se exigido na apresentação, Swagger dos serviços). Identity e Budget devem preferencialmente ter ingress interno e ser acessados pelo BFF por suas URLs internas.

## Configurações e secrets

### Web Shell

Build args públicos: `VITE_BFF_BASE_URL`, `VITE_MFE_CONTA_URL`, `VITE_MFE_ORCAMENTOS_URL`. Exemplos: `https://bff.exemplo.com`, `https://conta.exemplo.com/remoteEntry.js`. Não coloque segredos `VITE_*`.

### MFEs

Build arg público: `VITE_BFF_BASE_URL=https://bff.exemplo.com`. Ambos chamam somente o BFF e recebem a sessão em memória do Web Shell.

### BFF

`PORT=3000`, `NODE_ENV=production`, `IDENTITY_SERVICE_URL`, `BUDGET_SERVICE_URL`, `MONITORING_SERVICE_URL`, `AZURE_FUNCTION_KEY`, `HTTP_TIMEOUT_MS`, `CORS_ALLOWED_ORIGINS=https://<web-shell-publico>`. `AZURE_FUNCTION_KEY` é secret do BFF; não é variável Vite e não vai ao navegador. Não use `*` em `CORS_ALLOWED_ORIGINS`.

### Identity

`PORT=3001`, `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DATABASE=db_identity`, `MONGODB_MAX_POOL_SIZE`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`. O `JWT_SECRET` deve ser o mesmo no Budget e Monitoring do mesmo ambiente.

### Budget

`PORT=3002`, `NODE_ENV=production`, `JWT_SECRET`, `AZURE_SQL_SERVER=dbbudget.database.windows.net`, `AZURE_SQL_PORT=1433`, `AZURE_SQL_DATABASE=db_budget`, `AZURE_SQL_AUTHENTICATION=azure-active-directory-default`, `AZURE_SQL_ENCRYPT=true`, `AZURE_SQL_TRUST_SERVER_CERTIFICATE=false`, `AZURE_SQL_POOL_MAX=10`.

Para Managed Identity, habilite uma identidade na Container App e conceda a ela acesso ao Azure SQL; não use Azure CLI nem credenciais SQL no contêiner. Para user-assigned identity, adicione `AZURE_CLIENT_ID`. O readiness `/readiness` é a comprovação real da conectividade SQL.

Outbox de produção: `AZURE_STORAGE_QUEUE_NAME=orcamentos-eventos`, `AZURE_STORAGE_ACCOUNT_URL=https://<storage>.queue.core.windows.net`, `OUTBOX_BATCH_SIZE`, `OUTBOX_TIMEOUT_MS`, `OUTBOX_RETRY_MAX_TRIES`, `OUTBOX_PUBLISHER_SINGLE_INSTANCE=true`. Não configure `UseDevelopmentStorage=true` em produção. A versão atual requer uma única instância do publisher.

### Monitoring Function App

Application settings: `AzureWebJobsStorage=<connection-string-storage-real>`, `FUNCTIONS_WORKER_RUNTIME=node`, `ORCAMENTOS_EVENTOS_QUEUE_NAME=orcamentos-eventos`, `MONGODB_MONITORING_URI`, `MONGODB_MONITORING_DATABASE=db_monitoring`, `JWT_SECRET`, `MONITORING_COLLECTION_ENABLED=false`, `MONITORING_COLLECTION_SCHEDULE`, `MONITORING_COLLECTION_BATCH_SIZE`, `MONITORING_COLLECTION_CONCURRENCY`, `MONITORING_CATALOG_TIMEOUT_MS`; opcionais: `GEMINI_API_KEY`, `GEMINI_MODEL`.

Nunca copie `local.settings.json` para Azure. `UseDevelopmentStorage=true`, `orcamentos-eventos-teste` e `db_monitoring_test` são apenas desenvolvimento. O timer permanece desabilitado por padrão.

## Ordem prática de publicação

1. Conferir `npm test` e `npm run build` em cada projeto alterado.
2. Criar/confirmar secrets e permissões: MongoDB, JWT compartilhado, Function Key, Managed Identity no SQL e Storage real.
3. Publicar imagens Docker Hub pelos comandos acima.
4. Atualizar/publicar a Function App existente com o conteúdo de `functions/monitoring-service`, preservando funções não relacionadas. Antes, confirme nomes, rotas e configurações já existentes; não substitua `host.json` nem application settings de outras funções sem revisão.
5. Criar/atualizar Container Apps internas: Identity, Budget e BFF. Configure ingress e secrets antes de escalar.
6. Validar `/health` e `/readiness` dos serviços. Não considere Azure SQL ou Mongo prontos sem readiness HTTP 200.
7. Publicar MFE Conta e MFE Orçamentos; anotar suas URLs públicas `remoteEntry.js`.
8. Construir e publicar o Web Shell **por último**, com as URLs definitivas dos dois remotes e do BFF.
9. Configurar a origem pública exata do Web Shell em `CORS_ALLOWED_ORIGINS` do BFF e validar login, orçamento, agregação e oportunidades.

## Verificação pública

```bash
curl -i https://<bff-publico>/health
curl -i https://<identity-publico-ou-interno>/health
curl -i https://<identity-publico-ou-interno>/readiness
curl -i https://<budget-publico-ou-interno>/health
curl -i https://<budget-publico-ou-interno>/readiness
curl -I https://<bff-publico>/api-docs
curl -i -H "Authorization: Bearer <jwt>" https://<bff-publico>/aggregated-data
curl -i -X POST -H "Authorization: Bearer <jwt>" https://<bff-publico>/api/v1/monitoramento/orcamentos/<orcamento-id>/analisar
curl -i -H "Authorization: Bearer <jwt>" https://<bff-publico>/api/v1/monitoramento/oportunidades/<orcamento-id>
```

Confira também no navegador: `https://<mfe-conta-publico>/remoteEntry.js`, `https://<mfe-orcamentos-publico>/remoteEntry.js` e Web Shell sem erro de CORS ou de componente remoto. A análise requer uma assinatura `MONITORANDO` já sincronizada no Monitoring Service.

## Riscos e limitações

- Azure for Students pode impor cotas, regiões indisponíveis e limites de Container Apps/Function/Storage. Se houver bloqueio, use os recursos já existentes e documente a limitação com captura do portal.
- O catálogo e os preços são fictícios; Gemini é opcional e não decide sem validação determinística.
- Não escale o worker Publisher acima de uma instância nesta entrega.
- Function Key e JWT são secrets; não os coloque em imagens, comandos salvos, README público ou vídeos.
