# Arquitetura da fundação — Etapa 01

O arc42 fornecido no diretório raiz foi usado como baseline. As adaptações explícitas desta entrega prevalecem sobre ele: o BFF é Express executável localmente; Identity usa MongoDB Atlas na etapa de persistência futura; Budget usará Azure SQL; Monitoring permanece preservado para análise posterior.

## Limites de responsabilidade

- **Web Shell** compõe a navegação; **MFE Conta** e **MFE Orçamentos** são builds Vite independentes.
- **BFF** será a única borda pública e futuramente terá `GET /aggregated-data`; não há agregação nesta etapa.
- **Identity** será proprietário de contas, credenciais e ciclo de privacidade.
- **Budget** será proprietário de orçamentos, itens, lojas e estados.
- **Monitoring** será responsável por snapshots, análise e oportunidades em etapa futura.

## Organização dos serviços HTTP

Cada serviço possui `src/domain`, `src/application/features`, `src/infrastructure` e `src/api`. O health check é uma rota de borda deliberadamente pequena: não requer abstrações de banco e não afirma que uma dependência externa esteja disponível. Dependências técnicas devem apontar para dentro; implementação de MongoDB/Azure SQL, filas e casos de uso serão incluídos somente quando seus fluxos forem iniciados.

## Contratos já reservados

As interfaces OpenAPI expõem exclusivamente `/health`. Os caminhos de negócio do arc42, sob `/api/v1`, e os eventos versionados não foram publicados antes de suas implementações. Isso evita anunciar contratos como existentes.

