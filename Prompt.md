# Primeiro Prompt do projeto TD1

Atue como Arquiteto de Software Frontend. Preciso refazer do zero a aplicação React para o projeto "OrquestraCompras" (sistema de alertas e orçamentos de produtos em lojas de confiança).

DIRETRIZES DE ARQUITETURA, SEGURANÇA E BOAS PRÁTICAS:
1. O Frontend deve focar exclusivamente em UI/UX e validações visuais. Nenhuma regra de cálculo, busca por IA ou manipulação de dados fica na UI.
2. Nenhuma URL de API ou chave pode ficar hardcoded no código. Utilize exclusivamente variáveis de ambiente com import.meta.env.VITE_API_URL.
3. O projeto DEVE ser totalmente modularizado e preparado para deploy no GitHub Pages.

ESTRUTURA DE PASTAS OBRIGATÓRIA:

src/
├── components/           # Componentes desacoplados (Navbar.jsx, FormOrcamento.jsx, CardAlerta.jsx)
├── pages/                # Views da aplicação (ConfiguracaoPage.jsx, OportunidadesPage.jsx)
├── services/             # Camada de comunicação HTTP
│   └── api.js            # Fetch com fallback/try-catch tratando import.meta.env.VITE_API_URL
├── config/               # Gerenciador de ambiente
│   └── env.js
├── App.jsx               # Gestão das telas/abas
├── main.jsx              # Entrypoint
└── styles.css            # Estilização limpa/responsiva

ARQUIVOS DE CONFIGURAÇÃO DE BUILD (ESSENCIAIS PARA GITHUB PAGES):

1. index.html (na raiz):
   - Import do script relativo: <script type="module" src="./src/main.jsx"></script>
   - Title: "OrquestraCompras - Alertas & Orçamentos"

2. vite.config.js (na raiz):
   - Deve conter 'base: "./"' para garantir que os assets funcionem em qualquer subcaminho/GitHub Pages.

3. package.json:
   - Adicione os scripts:
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"

4. Arquivo .env e .env.production (na raiz):
   VITE_API_URL=https://pjbl-lucas-pucpr-2026-gwezgmdagtewdfgy.canadacentral-01.azurewebsites.net/api/GetAlertasOrcamento

DOCUMENTAÇÃO OBRIGATÓRIA (Crie estes arquivos na raiz):
- GRUPO.md (Nomes dos integrantes do grupo)
- Prompt.md (Este prompt na íntegra)
- README.md (Descrição da arquitetura desacoplada e links públicos)

Gere todos os arquivos completos, estruturados e corrigidos.



# Prompt VERTICAL SLICE, CLEAN ARCHITECTURE e SOLID

Você é um Arquiteto de Software Especialista em Backend. 

Preciso refatorar o backend da nossa aplicação ("OrquestraCompras - Alertas e Orçamentos") aplicando:
1. Vertical Slice Architecture (VSA)
2. Clean Architecture
3. Princípios SOLID

Contexto da Aplicação:
- Domínio: Gerenciamento e monitoramento de alertas de compras/orçamentos (campos: id, projeto/nomeAlerta, orcamentoAlvo, status, lista de produtos com item/preço/loja e lojas de confiança).
- Integração atual: Banco de dados MongoDB Atlas e execução via Azure Functions / HTTP APIs.

Requisitos da Refatoração:
1. Reestruture a base de código em fatias verticais (Vertical Slices por caso de uso/feature, ex: `Features/CriarAlerta`, `Features/ListarAlertas`, `Features/AtualizarAlerta`, `Features/ExcluirAlerta`).
2. Aplique Clean Architecture dentro de cada fatia ou núcleo compartilhado:
   - O domínio e regras de negócio não devem depender de frameworks ou bibliotecas do banco de dados (MongoDB).
   - Use Inversão de Dependência (DIP) para repositórios e serviços externos.
3. Demonstre estritamente os princípios SOLID:
   - S (SRP): Cada comando, query, validador e handler com uma única responsabilidade.
   - O (OCP): Extensibilidade sem modificação via interfaces/estratégias.
   - L (LSP): Implementações intercambiáveis (ex: repositórios que respeitam contratos).
   - I (ISP): Interfaces enxutas e focadas em operações específicas.
   - D (DIP): Módulos de alto nível dependem de abstrações (interfaces), não de implementações concretas do MongoDB ou Azure SDK.

Entregáveis esperados nesta resposta:
1. A nova estrutura de pastas completa da aplicação.
2. O código refatorado de ponta a ponta para a fatia principal (`Features/CriarAlerta` e `Features/ListarAlertas`), contendo:
   - Entidade de Domínio / Regras de negócio
   - Contratos / Interfaces (Repository / Services)
   - Implementação de Repositório (MongoDB Driver / Mongoose)
   - Handler / Use Case da fatia
   - Ponto de entrada HTTP (Azure Function / Controller)
3. Breve justificativa técnica indicando onde cada princípio SOLID foi aplicado no código.
