# Modelação da Arquitetura do Sistema

Documento descritivo dos diagramas de classes e de componentes do sistema de alertas.

---

## 1. Diagrama de Classes

classDiagram
    class CriarAlertaFunction {
        +handler(request, context): HttpResponse
    }

    class CriarAlertaCommand {
        +String nomeAlerta
        +Number orcamentoAlvo
        +Object[] produtos
        +String[] lojasConfianca
    }

    class IAlertaNotifier {
        <<interface>>
        +notificarAlertaCriado(alerta): void
    }

    class CriarAlertaValidator {
        +validate(command): void
    }

    class CriarAlertaHandler {
        -IAlertaWriterRepository alertaWriterRepository
        -CriarAlertaValidator validator
        +execute(command): Alerta
    }

    class IAlertaWriterRepository {
        <<interface>>
        +adicionar(alerta): Alerta
    }

    class Alerta {
        +String id
        +String nomeAlerta
        +Number orcamentoAlvo
        +String status
        +Produto[] produtos
        +String[] lojasConfianca
        +criar(dados): Alerta
    }

    class DomainValidationError {
        +String message
    }

    class Produto {
        +String item
        +Number preco
        +String loja
    }

    class CompositionRoot {
        +buildApplication(environment): Object
        +getApplication(): Object
    }

    class MongoAlertaRepository {
        -MongoConnection connection
        -String collectionName
        +adicionar(alerta): Alerta
        +listar(): Alerta[]
    }

    class MongoConnection {
        -String connectionString
        -String databaseName
        -MongoClient client
        +database(): Db
    }

    class IAlertaReaderRepository {
        <<interface>>
        +listar(): Alerta[]
    }

    class ListarAlertasHandler {
        -IAlertaReaderRepository alertaReaderRepository
        +execute(query): AlertaResponse[]
    }

    class ListarAlertasFunction {
        +handler(request, context): HttpResponse
    }

    class ListarAlertasQuery

    class AlertaResponse {
        +paraAlertaResponse(alerta): Object
    }

    %% Relações - Criar Alerta
    CriarAlertaFunction ..> CriarAlertaCommand : cria
    CriarAlertaFunction --> CriarAlertaHandler : executa
    CompositionRoot ..> CriarAlertaHandler : injeta dependência
    CriarAlertaHandler ..> IAlertaNotifier : extensão opcional
    CriarAlertaHandler --> CriarAlertaValidator : valida
    CriarAlertaHandler ..> IAlertaWriterRepository : depende
    CriarAlertaHandler --> Alerta : cria

    %% Domínio
    Alerta ..> DomainValidationError : lança
    Alerta *-- Produto : contém

    %% Persistência & Injeção
    CompositionRoot ..> MongoAlertaRepository : instancia
    MongoAlertaRepository ..|> IAlertaWriterRepository : realiza
    MongoAlertaRepository ..|> IAlertaReaderRepository : realiza
    MongoAlertaRepository --> MongoConnection : usa

    %% Relações - Listar Alertas
    CompositionRoot ..> ListarAlertasHandler : injeta dependência
    ListarAlertasFunction ..> ListarAlertasQuery : cria
    ListarAlertasFunction --> ListarAlertasHandler : executa
    ListarAlertasHandler ..> IAlertaReaderRepository : depende
    ListarAlertasHandler --> AlertaResponse : transforma

## 2. Diagrama de Componentes (Clean Architecture / Vertical Slice)

    flowchart TB
    subgraph UI ["Camada de Apresentação"]
        React["Frontend React"]
    end

    subgraph AdaptersIn ["Adaptadores de Entrada"]
        FuncPost["Azure Function<br/>POST /api/alertas"]
        FuncGet["Azure Function<br/>GET /api/alertas"]
    end

    subgraph Features ["Features / Vertical Slices"]
        subgraph SliceCriar ["Criar Alerta"]
            Cmd["CriarAlertaCommand"]
            Val["CriarAlertaValidator"]
            HandlerCriar["CriarAlertaHandler"]
            Cmd --> Val --> HandlerCriar
        end

        subgraph SliceListar ["Listar Alertas"]
            Qry["ListarAlertasQuery"]
            HandlerListar["ListarAlertasHandler"]
            Resp["AlertaResponse"]
            Qry --> HandlerListar --> Resp
        end

        subgraph SliceFuturo ["Entes futuros"]
            Upd["AtualizarAlerta<br/>Command / Validator / Handler"]
            Del["ExcluirAlerta<br/>Command / Handler"]
        end
    end

    subgraph Domain ["Domínio Puro"]
        Alerta["Alerta"]
        Produto["Produto"]
        DomErr["DomainValidationError"]
        Alerta --- Produto
        Alerta --- DomErr
    end

    subgraph Ports ["Application Ports / Contratos"]
        PortNotif["IAlertaNotifier<br/>(extensão futura)"]
        PortWriter["IAlertaWriterRepository"]
        PortReader["IAlertaReaderRepository"]
    end

    subgraph AdaptersOut ["Adaptadores de Saída"]
        Repo["MongoAlertaRepository"]
        Conn["MongoConnection"]
        NotifAdapter["Azure Notification Hub /<br/>E-mail / WhatsApp Adaptor"]
        Repo --> Conn
    end

    subgraph External ["Serviços Externos / Infraestrutura"]
        MongoAtlas[("MongoDB Atlas")]
        NotifService["Serviço de Notificação"]
    end

    %% Chamadas de Entrada
    React --> FuncPost
    React --> FuncGet
    FuncPost --> Cmd
    FuncGet --> Qry

    %% Dependências das Features
    HandlerCriar -.->|depende de abstração| PortWriter
    HandlerCriar -.->|opcional| PortNotif
    HandlerCriar --> Domain

    HandlerListar -.->|depende de abstração| PortReader

    %% Implementações das Portas
    Repo -.->|implementa| PortWriter
    Repo -.->|implementa| PortReader
    NotifAdapter -.->|implementa| PortNotif

    %% Saídas Externas
    Conn --> MongoAtlas
    NotifAdapter --> NotifService