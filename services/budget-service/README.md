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

## JWT entre serviços

O Identity assina tokens HMAC `HS256` com `sub` como identificador do usuário. O Budget verifica `JWT_SECRET` com o mesmo valor do Identity no mesmo ambiente, restringe o algoritmo a `HS256` e usa exclusivamente `sub` como proprietário. Não inclua aspas ou o prefixo `Bearer` no valor informado no Swagger. A validação local não consulta o Identity, portanto a revogação ou o estado alterado da conta só serão refletidos quando a integração distribuída for implementada.
