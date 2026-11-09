# Budget Service

Gerencia projetos de compra, itens, lojas e estados. `GET /health` não toca no banco; `GET /readiness` faz uma consulta real ao Azure SQL.

```powershell
npm install
npm run dev
npm test
```

Swagger: `http://localhost:3002/api-docs`.

## Azure SQL com Microsoft Entra

Copie `.env.example` para `.env`. A conexão usa `azure-active-directory-default`, sem senha ou token no arquivo. Em desenvolvimento, execute `az login`; a credencial do Azure CLI será usada. Na Azure, `DefaultAzureCredential` usa Managed Identity; para identidade atribuída pelo usuário, informe apenas `AZURE_CLIENT_ID`.

Use `dbbudget.database.windows.net` e o banco `db_budget`. Mantenha TLS com `AZURE_SQL_ENCRYPT=true` e `AZURE_SQL_TRUST_SERVER_CERTIFICATE=false`.

## Transactional Outbox Publisher

O CRUD grava `EventoOrcamentoV1` em `eventos_outbox` na mesma transação do orçamento. O publisher é um processo explícito e independente das rotas HTTP:

```powershell
npm run outbox:once
```

Ele seleciona no máximo `OUTBOX_BATCH_SIZE` eventos em que `publicado_em IS NULL`, em ordem de `ocorrido_em, id`. Cada mensagem é o JSON do `EventoOrcamentoV1` já persistido, com o `eventId` original. A mensagem é enviada para `AZURE_STORAGE_QUEUE_NAME` (padrão `orcamentos-eventos`) e somente então o registro recebe `publicado_em`.

Use `AZURE_STORAGE_ACCOUNT_URL` com `DefaultAzureCredential` (Azure CLI local ou Managed Identity publicada) ou, exclusivamente em Azurite/fila de teste controlada, `AZURE_STORAGE_CONNECTION_STRING`. A fila deve existir previamente: este projeto não cria recursos Azure. O payload é limitado a 64 KiB, limite da Azure Storage Queue.

Há garantia de entrega **pelo menos uma vez**. Se a fila confirmar a mensagem e o processo falhar antes de gravar `publicado_em`, o mesmo `eventId` será reenviado na próxima execução. O consumidor deve deduplicar por esse identificador; não há promessa de exactly-once.

O schema atual não contém lease/claim para múltiplas instâncias. Assim, `OUTBOX_PUBLISHER_SINGLE_INSTANCE=true` é obrigatório nesta versão: execute apenas uma instância do comando por vez. Há uma trava em memória para chamadas concorrentes no mesmo processo, mas uma estratégia distribuída exigirá migration de claim na Etapa 06B.

### Validação manual controlada

1. Em uma fila de teste isolada já existente, configure somente as variáveis de storage em `.env`.
2. Consulte, sem alterar dados, `SELECT id, tipo, ocorrido_em, publicado_em FROM eventos_outbox WHERE publicado_em IS NULL ORDER BY ocorrido_em, id`.
3. Execute `npm run outbox:once` uma única vez.
4. Confirme a mensagem na fila pelo Azure Portal/Azurite e verifique que o JSON mantém o mesmo `eventId`.
5. Consulte o mesmo registro para confirmar `publicado_em`. Em caso de falha, não exclua registros: o evento deve permanecer pendente para investigação/reexecução controlada.

### Publicação controlada para integração local

`outbox:once` continua selecionando um lote de pendências e não deve ser usado no banco compartilhado durante testes. Para um único evento novo e autorizado, use exclusivamente o modo controlado. Ele requer, no `.env` local, `OUTBOX_TEST_EVENT_ID` com UUID válido, `OUTBOX_PUBLISHER_SINGLE_INSTANCE=true`, `AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true` e `AZURE_STORAGE_QUEUE_NAME=orcamentos-eventos-teste`. Qualquer outro Storage ou fila é bloqueado antes de consultar/publicar.

```powershell
npm run outbox:test:dry-run
npm run outbox:test
```

O dry-run é somente leitura: busca apenas aquele `eventId` pendente e informa `selecionados=0|1`, sem enviar ou atualizar `publicado_em`. O envio real continua limitado ao mesmo `eventId`; nenhum outro registro é selecionado ou confirmado. Evento inexistente ou já publicado resulta em `selecionados=0` e código de saída diferente de zero.

Roteiro seguro de integração: (1) crie um orçamento fictício em ambiente autorizado para gerar um novo evento; (2) obtenha o `id` correspondente em `eventos_outbox`; (3) confirme que ele pertence ao teste; (4) defina-o em `OUTBOX_TEST_EVENT_ID`; (5) execute o dry-run; (6) execute o modo controlado com Azurite e o Queue Trigger local ativos; (7) confirme somente esse `id` com `publicado_em`; (8) no MongoDB de teste, conte `db_monitoring_test.eventos_processados` filtrando por esse mesmo `eventId` e confirme `1`; (9) reenvie manualmente o mesmo JSON de teste somente se precisar demonstrar a idempotência, esperando ainda um único documento.

Esta versão continua limitada a uma instância do publisher. A trava em memória não coordena processos/instâncias distribuídos.

### Diagnóstico seguro de falhas do publisher

Quando uma execução controlada falhar, o log informa uma única etapa: `SELECT_OUTBOX`, `SERIALIZE_EVENT`, `SEND_QUEUE` ou `CONFIRM_SQL`, além de código, nome, status HTTP quando disponível e mensagem sanitizada. Não são registrados connection strings, JWTs, tokens, snapshots ou valores financeiros.

Antes de uma nova execução autorizada, consulte somente o `eventId` de teste na Outbox e inspecione a fila local: se já houver mensagem com o mesmo `eventId` e `publicado_em` ainda estiver nulo, trate-o como cenário at-least-once e não conclua que o envio falhou. Se não houver mensagem, use o novo log para identificar a etapa. Não altere nem marque manualmente outros eventos pendentes.

## JWT entre serviços

O Identity assina tokens HMAC `HS256` com `sub` como identificador do usuário. O Budget verifica `JWT_SECRET` com o mesmo valor do Identity no mesmo ambiente, restringe o algoritmo a `HS256` e usa exclusivamente `sub` como proprietário. Não inclua aspas ou o prefixo `Bearer` no valor informado no Swagger. A validação local não consulta o Identity, portanto a revogação ou o estado alterado da conta só serão refletidos quando a integração distribuída for implementada.
