# Backend — OrquestraCompras

Backend em Node.js, Azure Functions v4 e MongoDB Driver, estruturado por fatias verticais.

## Estrutura

```text
src/
├── Domain/
│   ├── Alert/                         # Entidades e invariantes puras
│   └── Errors/
├── Application/Ports/                 # Abstrações de leitura e escrita
├── Features/
│   ├── CriarAlerta/                   # Command, validator e handler
│   ├── ListarAlertas/                 # Query, response DTO e handler
│   ├── AtualizarAlerta/               # Próxima fatia: command, validator, handler
│   └── ExcluirAlerta/                 # Próxima fatia: command e handler
├── Infrastructure/
│   ├── Mongo/                         # Adaptador MongoDB
│   ├── Http/                          # Respostas e mapeamento de erro
│   └── CompositionRoot.js              # Único local de wiring
├── Functions/                         # Adaptadores HTTP/Azure
└── index.js
```

As fatias `AtualizarAlerta` e `ExcluirAlerta` devem usar, respectivamente, portas pequenas
`IAlertaUpdaterRepository` e `IAlertaDeleterRepository`; não se deve aumentar as portas de
leitura/escrita já existentes.

## Decisões SOLID

- **SRP:** command, validator, handler, entidade, adaptador Mongo e Function têm responsabilidades separadas.
- **OCP/LSP:** qualquer adaptador que cumpra `IAlertaWriterRepository` e `IAlertaReaderRepository` pode substituir Mongo (por exemplo, memória em testes) sem alterar handlers.
- **ISP:** leitura e escrita são contratos diferentes; quem lista não recebe permissão de gravar.
- **DIP:** handlers dependem de portas; `CompositionRoot` é o único lugar que conhece MongoDB e suas variáveis.

## Executar

1. Copie `local.settings.example.json` para `local.settings.json` e informe as variáveis do MongoDB.
2. Execute `npm install` dentro da pasta `CodigoFonte/backend`.
3. Execute `npm start`.

## API

`POST /api/alertas`

```json
{
  "nomeAlerta": "Sala de estar",
  "orcamentoAlvo": 5000,
  "produtos": [{ "item": "Sofá", "preco": 3200, "loja": "Loja A" }],
  "lojasConfianca": ["Loja A"]
}
```

`GET /api/alertas` retorna `{ "alertas": [...] }`. O frontend também usa `PUT /api/alertas?id=<id>` para atualizar o orçamento e `DELETE /api/alertas?id=<id>` para excluir um alerta.

O POST também aceita o payload legado do frontend: `projeto`, produtos em texto e `lojas`.
