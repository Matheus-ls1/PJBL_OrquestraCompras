# BFF

Entrada HTTP pública do OrquestraCompras. O endpoint autenticado `GET /aggregated-data` agrega o perfil do Identity Service, os orçamentos do Budget Service e o resumo calculado pela Azure Function. O navegador acessa somente este BFF.

## Execução

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

URLs locais padrão: Identity `http://localhost:3001`, Budget `http://localhost:3002`, Function `http://localhost:7071` e BFF `http://localhost:3000`. Em produção, configure `AZURE_FUNCTION_KEY` exclusivamente no ambiente do BFF; ela é encaminhada como `x-functions-key` e nunca é exposta ao cliente.

Com os três componentes locais iniciados e um JWT válido:

```powershell
$headers = @{ Authorization = 'Bearer <JWT_VALIDO>' }
Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/aggregated-data' -Headers $headers
```

`/health` não consulta dependências. Swagger permanece disponível em `/api-docs`. Execute `npm test` e `npm run build` para validação local.
