# Prompt do projeto

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
