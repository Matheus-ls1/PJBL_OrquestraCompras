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

Filas, Queue Triggers, snapshots persistidos, IA/fallback heurístico e a chamada pelo BFF permanecem pendentes para etapas posteriores.
