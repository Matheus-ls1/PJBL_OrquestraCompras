# MFE Orçamentos

Microfrontend React/Vite independente para gerenciar orçamentos reais exclusivamente pelo BFF.

```powershell
npm install
npm run dev
npm test
npm run build
```

O MFE usa `http://localhost:5175`. Configure `VITE_BFF_BASE_URL=http://localhost:3000` em `.env.local`, sem segredos. O BFF precisa autorizar `http://localhost:5175` em `CORS_ALLOWED_ORIGINS`.

Para desenvolvimento independente, informe manualmente no formulário inicial um JWT válido emitido pelo login do MFE Conta. O token não é persistido. Na Etapa 05D, o Web Shell deve fornecer `accessToken` e `onSessionInvalid` como interface de composição, sem importar internamente o MFE Conta.
