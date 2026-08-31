# OrquestraCompras

Frontend React para consulta visual de alertas e orçamentos de produtos em lojas de confiança.

## Arquitetura

A aplicação separa a interface em `components` e `pages`, mantém a configuração de ambiente em `src/config/env.js` e isola a comunicação HTTP em `src/services/api.js`. A UI não contém regras de cálculo, inteligência artificial ou processamento de dados de negócio; ela apenas apresenta estados e valida campos visualmente.

A URL do serviço é lida somente por `import.meta.env.VITE_API_URL`. Nunca inclua credenciais ou URLs de produção diretamente no código-fonte.

## Executar e publicar

```bash
npm install
npm run dev
npm run build
npm run deploy
```

O `vite.config.js` utiliza `base: './'`, permitindo o carregamento dos assets em subdiretórios, incluindo GitHub Pages.

## Links públicos

- Aplicação: "https://matheus-ls1.github.io/PJBL_OrquestraCompras/".
- Repositório: "https://github.com/Matheus-ls1/PJBL_OrquestraCompras.git".
