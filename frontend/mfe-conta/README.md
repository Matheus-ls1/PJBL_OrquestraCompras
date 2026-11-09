# MFE Conta

Microfrontend React/Vite independente para cadastro, login, perfil, senha, logout e solicitação de encerramento. Todas as chamadas usam exclusivamente o BFF.

```powershell
npm install
npm run dev
npm test
npm run build
```

O Vite usa `http://localhost:5174`. Configure `VITE_BFF_BASE_URL=http://localhost:3000` em um `.env.local` não versionado se o BFF estiver em outro endereço. O BFF deve autorizar `http://localhost:5174` em `CORS_ALLOWED_ORIGINS`.

Faça login com uma conta de teste autorizada, criada pelo próprio fluxo de cadastro ou já existente no Identity Service. A sessão é mantida apenas em memória: ao recarregar a página, será necessário autenticar novamente. Na futura composição, o Web Shell poderá fornecer ou consumir o `SessionProvider`; nenhum token é armazenado em `localStorage`.
