# Monitoring Service

Azure Function HTTP da Etapa 04A. Ela calcula um resumo financeiro a partir de orçamentos resumidos recebidos do BFF; não consulta MongoDB, Azure SQL, filas ou serviços externos.

## Endpoint

Com o prefixo padrão `api` do Azure Functions, a Function é exposta em:

`POST http://localhost:7071/api/v1/monitoramento/resumo-financeiro`

Em produção ela usa `authLevel: function`. O futuro BFF deve guardar a chave no ambiente do servidor e enviá-la no cabeçalho `x-functions-key`; a chave não pertence ao frontend nem a arquivos versionados.

Entrada:

```json
{
  "orcamentos": [
    { "valorLimite": 5000 },
    { "valorLimite": 3000 }
  ]
}
```

Resposta:

```json
{
  "totalOrcamentos": 2,
  "somaLimites": 8000,
  "mediaLimites": 4000,
  "origem": "azure-function",
  "tipoAnalise": "RESUMO_FINANCEIRO"
}
```

Valores devem ser números finitos e não negativos. A lista pode estar vazia e todos os valores monetários de saída são normalizados para duas casas decimais. Entradas inválidas retornam `400` com um envelope de erro, sem ecoar o corpo recebido.

## Execução local

1. Instale o Node.js 20 LTS e o Azure Functions Core Tools v4.
2. Execute `npm install` nesta pasta.
3. Crie `local.settings.json` a partir de `local.settings.json.example`. Para este trigger, `AzureWebJobsStorage=UseDevelopmentStorage=true` requer o Azurite em execução; nenhuma chave de Function é necessária no arquivo para o teste local padrão. O `.env.example` é apenas uma referência das variáveis e não é lido automaticamente pelo Functions Runtime.
4. Execute `npm start`.

O Core Tools usa a porta `7071` por padrão. Exemplo no PowerShell:

```powershell
$body = @{ orcamentos = @(@{ valorLimite = 5000 }, @{ valorLimite = 3000 }) } | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri 'http://localhost:7071/api/v1/monitoramento/resumo-financeiro' -ContentType 'application/json' -Body $body
```

Para validar qualidade localmente, execute `npm test` e `npm run build`.

## Estrutura

- `src/functions`: adaptador HTTP Azure Functions v4;
- `src/application`: caso de uso por Vertical Slice;
- `src/domain`: validação e cálculo financeiro puros;
- `test`: testes sem Azure Functions Runtime.

## Queue Trigger: EventoOrcamentoV1

Além da Function HTTP, o projeto registra `processarEventoOrcamento`, um Queue Trigger v4 para a fila definida por `ORCAMENTOS_EVENTOS_QUEUE_NAME` (padrão `orcamentos-eventos`). A conexão do binding é sempre a configuração `AzureWebJobsStorage`; não há chave ou connection string no código.

O Outbox Publisher do Budget Service envia o JSON bruto de `EventoOrcamentoV1` com `QueueClient.sendMessage(JSON.stringify(evento))`, sem Base64. Por isso, `host.json` define `extensions.queues.messageEncoding` como `none`. Não altere esse valor sem alterar também o produtor e os testes de contrato.

O runtime Node.js v4 pode entregar a mensagem como texto JSON ou como objeto JavaScript já desserializado. O adaptador aceita ambos os formatos, aplica `JSON.parse` somente ao texto e encaminha o objeto diretamente ao mesmo validador de domínio. Valores nulos, arrays, objetos fora do contrato e JSON malformado continuam falhando para retry/poison queue.

O contrato consumido é:

```json
{
  "eventId": "UUID",
  "tipo": "EventoOrcamentoV1",
  "acao": "OrcamentoAtualizado",
  "orcamentoId": "UUID",
  "usuarioId": "…",
  "versaoEvento": 2,
  "dataOcorrencia": "2026-11-09T10:00:00.000Z",
  "snapshot": {}
}
```

São aceitas somente as ações emitidas pelo Budget Service. Mensagem inválida ou falha de persistência lança erro para o runtime aplicar retries e, após `maxDequeueCount: 5`, encaminhar a mensagem para a poison queue `<fila>-poison`. Logs registram apenas `eventId`, indicador de duplicidade e código técnico — nunca o snapshot, JWT ou credenciais.

### Idempotência e persistência

O Monitoring Service é dono de `db_monitoring`. A coleção `eventos_processados` cria o índice único `eventId` e registra o evento por `updateOne` com `upsert`, evitando a janela insegura de consultar e depois inserir. O registro armazena `eventId`, `orcamentoId`, ação, versão, instante do evento, instante de processamento e snapshot. Reentregas retornam como duplicadas sem repetir efeitos.

Nesta etapa não há alertas, coleta de preços, IA ou recomendação de compra. Esses efeitos futuros deverão usar o mesmo registro idempotente como base.

## Sincronização de snapshots de orçamento

O processamento de `EventoOrcamentoV1` também materializa `assinaturasMonitoramento`, uma visão própria do Monitoring Service em `db_monitoring`. Cada documento possui `orcamentoId` normalizado, `usuarioId`, `versaoEvento`, `status`, `valorLimite`, `itensSnapshot`, `lojasSnapshot`, `atualizadoEm`, `ativoParaMonitoramento` e `excluidoEm`.

Somente `MONITORANDO` fica ativo para monitoramento. Os demais estados reais do Budget (`RASCUNHO`, `PAUSADO`, `ALERTA_DISPARADO`, `CONCLUIDO` e `EXPIRADO`) são preservados, mas inativos. `OrcamentoExcluido` grava um tombstone (`excluidoEm`) e desativa a assinatura sem exclusão física.

O repositório usa índice único em `orcamentoId`, índice para assinaturas ativas e transação MongoDB: aplica a assinatura e marca `eventos_processados.assinaturaMaterializada=true` na mesma transação. Eventos antigos ou da mesma versão são ignorados; um tombstone impede reativação por mensagens atrasadas. Eventos antigos já existentes em `eventos_processados` sem a marca de materialização somente serão tratados se forem reentregues — não existe varredura/backfill automático.

Backfill, se necessário, deve ser uma operação administrativa futura e explícita, usando apenas eventos de teste autorizados e registrando os IDs processados. Não execute atualização em massa de históricos compartilhados.

### Validação manual futura da assinatura

1. Crie um orçamento fictício autorizado pelo BFF e identifique o novo `eventId` na Outbox.
2. Execute o Publisher controlado para somente esse evento, com Azurite e o Queue Trigger locais ativos.
3. Consulte `db_monitoring_test.assinaturasMonitoramento` pelo `orcamentoId` do orçamento de teste e confirme versão, itens, lojas, limite e estado.
4. Atualize o orçamento, publique exclusivamente o novo evento e confirme incremento de `versaoEvento` e atualização do snapshot.
5. Reenvie uma mensagem antiga somente na fila de teste e confirme que a assinatura não regride nem reativa tombstone.

## Coleta periódica de ofertas mock

`coletarOfertas` é um Timer Trigger v4 com agendamento `MONITORING_COLLECTION_SCHEDULE` (padrão: a cada 15 minutos). Ele busca em lotes somente assinaturas com `ativoParaMonitoramento=true`, `status=MONITORANDO` e sem `excluidoEm`. O trigger não executa durante a suíte de testes e também permanece desabilitado por padrão: defina explicitamente `MONITORING_COLLECTION_ENABLED=true` somente com Azurite e `db_monitoring_test` isolados.

O catálogo atual é `MockCatalogAdapter`: determinístico, rotulado `CATALOGO_MOCK` e sem chamadas externas. Ele oferece exemplos fictícios de CPU/Ryzen, GPU/RTX, RAM/DDR5 e SSD/NVMe, filtrando categoria, alternativas aceitas e lojas ativas autorizadas. As ofertas não representam preços reais nem recomendações de compra.

Cada execução cria uma entrada em `tentativasMonitoramento` com versão da assinatura, início/fim, contagens e erros sanitizados. As ofertas ficam em `ofertas`, relacionadas por `tentativaId`, orçamento, item, loja, fonte e data. Há índices únicos para tentativa e para `(tentativaId, ofertaId)`, preservando histórico entre tentativas sem duplicar a mesma oferta da mesma tentativa.

Para teste manual seguro, com o runtime local ativo e uma assinatura sintética `MONITORANDO` já materializada em `db_monitoring_test`, aguarde o agendamento ou invoque o handler apenas em ambiente local isolado. Consulte as coleções `tentativasMonitoramento` e `ofertas` por `orcamentoId`; não use assinaturas ou eventos históricos compartilhados. Coleta HTTP real, scraping, IA, heurísticas e oportunidades continuam fora do escopo.

### Execução local controlada

1. Instale Azure Functions Core Tools v4 e inicie o Azurite.
2. Copie `local.settings.json.example` para `local.settings.json` e informe uma fila de teste e um MongoDB de teste isolado. Não reutilize o banco do Identity.
3. Execute `npm start`.
4. Envie uma mensagem JSON de teste para a fila configurada, usando Azure Storage Explorer, Azurite ou o SDK. Não execute o Publisher contra a Outbox histórica compartilhada.
5. Verifique no log apenas o `eventId` e confirme em `db_monitoring.eventos_processados` que existe um documento com esse identificador.
6. Reenvie a mesma mensagem: o documento deve permanecer único e o log indicará `duplicate: true`.

Para simular uma falha sem remover mensagens, interrompa a conectividade do MongoDB de teste ou informe uma URI de teste inválida; o runtime aumentará `DequeueCount` e aplicará o `visibilityTimeout` de 30 segundos antes de mover a mensagem para a poison queue após o limite.

### Após corrigir uma falha de desserialização

1. Não remova mensagens existentes da poison queue: mantenha-as para inspeção.
2. Pare o Core Tools e inicie novamente com `npm start` no Monitoring Service.
3. Envie novamente o evento sintético já salvo com `npm run queue:test`.
4. Observe no log do runtime `EventoOrcamentoV1 processado` com o `eventId`, sem o snapshot.
5. Execute `npm run queue:test:verify`; o resultado esperado é `registros=1`.
6. Execute `npm run queue:test` novamente e, após o trigger processar, repita a verificação: a contagem deve permanecer `1`.

Para publicação futura na Function App `pjbl-lucas-pucpr-2026`, configure `AzureWebJobsStorage`, `ORCAMENTOS_EVENTOS_QUEUE_NAME`, `MONGODB_MONITORING_URI` e `MONGODB_MONITORING_DATABASE` como Application Settings, conceda ao produtor permissão de envio e à Function acesso à conta de Storage e ao MongoDB. Não foi realizado deploy nesta etapa.

## Utilitário seguro de teste da Queue

Para demonstrar o fluxo local sem tocar no Outbox, Azure SQL ou Storage real, há dois comandos de desenvolvimento:

```powershell
npm run queue:test
npm run queue:test:verify
```

`queue:test` lê `local.settings.json` e falha antes de enviar se os valores não forem exatamente `AzureWebJobsStorage=UseDevelopmentStorage=true`, `ORCAMENTOS_EVENTOS_QUEUE_NAME=orcamentos-eventos-teste` e `MONGODB_MONITORING_DATABASE=db_monitoring_test`. Ele cria na primeira execução um `EventoOrcamentoV1` integralmente sintético, validado pela mesma regra do domínio do consumidor, e o salva em `.queue-test/evento-orcamento-v1.json`. O diretório é ignorado pelo Git. Nas execuções posteriores, envia exatamente o mesmo JSON e `eventId`.

`queue:test:verify` é somente leitura no MongoDB: lê o evento persistido localmente e conta documentos em `db_monitoring_test.eventos_processados` com o `eventId` original. Após o runtime processar uma ou mais entregas, o resultado esperado é `registros=1`; o comando retorna código diferente de zero para outro resultado.

Pré-requisitos: Azurite em execução, a fila local `orcamentos-eventos-teste` já existente, o Functions Runtime ativo e `MONGODB_MONITORING_URI` apontando para o banco de teste isolado. O utilitário não cria fila, não cria recursos Azure e bloqueia connection strings diferentes do Azurite local.
# Oportunidades (07C/07D)

O endpoint `POST /api/v1/monitoramento/orcamentos/{id}/analisar`, exposto pela Function como `POST /api/v1/monitoramento/orcamentos/{id}/analisar`, exige Function Key (quando aplicável) e JWT HS256. Ele só analisa a assinatura do próprio titular em estado `MONITORANDO`, cria uma tentativa de catálogo mock e persiste uma oportunidade histórica. `GET /api/v1/monitoramento/oportunidades/{id}` retorna somente o histórico do titular.

Configure `JWT_SECRET` igual ao segredo de assinatura do Identity Service. `GEMINI_API_KEY` é opcional e permanece exclusivamente no backend; sem ela, a justificativa usa `IA_MOCK`. Se Gemini falhar, a decisão validada usa `FALLBACK_HEURISTICO`. O catálogo e os preços são fictícios para demonstração acadêmica.
