# Identity Service

Microsserviço proprietário de contas, credenciais, perfil e início do ciclo de privacidade. O `GET /health` confirma somente o processo; `GET /readiness` executa um `ping` real no MongoDB Atlas.

```powershell
npm install
npm run dev
npm test
```

Antes de autenticar, copie `.env.example` para `.env`, configure a URI do usuário técnico limitado a `db_identity` e defina um `JWT_SECRET` aleatório. Não versione esse arquivo.

Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET|PUT /api/v1/auth/profile`, `PUT /api/v1/auth/password` e `DELETE /api/v1/auth/account`.

Swagger: `http://localhost:3001/api-docs`.

O encerramento grava a transição para `ENCERRAMENTO_PENDENTE` e um `EventoContaEncerramentoSolicitadoV1` pendente no mesmo documento. Nenhuma fila é publicada e nenhum dado dos demais serviços é declarado como excluído nesta etapa.
