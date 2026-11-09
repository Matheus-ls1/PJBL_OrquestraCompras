# BFF

Entrada HTTP pública do OrquestraCompras. O navegador acessa somente este BFF: ele encaminha os contratos de autenticação em `/api/v1/auth`, o CRUD de orçamentos em `/api/v1/orcamentos` e expõe `GET /aggregated-data` para reunir perfil, orçamentos e resumo calculado pela Azure Function.

## Execução

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

URLs locais padrão: Identity `http://localhost:3001`, Budget `http://localhost:3002`, Function `http://localhost:7071` e BFF `http://localhost:3000`. Em produção, configure `AZURE_FUNCTION_KEY` exclusivamente no ambiente do BFF; ela é encaminhada como `x-functions-key` e nunca é exposta ao cliente. Configure `CORS_ALLOWED_ORIGINS` com origens exatas separadas por vírgula; `*` não é aceito.

Com os três componentes locais iniciados e um JWT válido:

```powershell
$headers = @{ Authorization = 'Bearer <JWT_VALIDO>' }
Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/aggregated-data' -Headers $headers
```

Para operações versionadas de orçamento, envie também `If-Match` com a versão atual. O Swagger em `/api-docs` contém os corpos, IDs e cabeçalhos de cada operação.

`/health` não consulta dependências. Swagger permanece disponível em `/api-docs`. Execute `npm test` e `npm run build` para validação local.
# Oportunidades de compra

O BFF expõe `POST /api/v1/monitoramento/orcamentos/:id/analisar` e `GET /api/v1/monitoramento/oportunidades/:id`. Ambos exigem Bearer JWT e encaminham a chave da Azure Function apenas no servidor através de `AZURE_FUNCTION_KEY`; o frontend não acessa a Function diretamente.
