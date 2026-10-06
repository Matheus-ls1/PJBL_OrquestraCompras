import { MongoConnection } from './Mongo/MongoConnection.js'
import { MongoAlertaRepository } from './Mongo/MongoAlertaRepository.js'
import { CriarAlertaValidator } from '../Features/CriarAlerta/CriarAlertaValidator.js'
import { CriarAlertaHandler } from '../Features/CriarAlerta/CriarAlertaHandler.js'
import { ListarAlertasHandler } from '../Features/ListarAlertas/ListarAlertasHandler.js'
import { AtualizarOrcamentoHandler } from '../Features/AtualizarAlerta/AtualizarOrcamentoHandler.js'
import { ExcluirAlertaHandler } from '../Features/ExcluirAlerta/ExcluirAlertaHandler.js'

export function buildApplication(environment = process.env) {
  if (!environment.MONGODB_URI || !environment.MONGODB_DATABASE) {
    throw new Error('MONGODB_URI e MONGODB_DATABASE são obrigatórias.')
  }
  const connection = new MongoConnection({
    connectionString: environment.MONGODB_URI,
    databaseName: environment.MONGODB_DATABASE,
  })
  const repository = new MongoAlertaRepository({
    connection,
    collectionName: environment.MONGODB_ALERTAS_COLLECTION || 'alertas',
  })
  return {
    criarAlerta: new CriarAlertaHandler({ alertaWriterRepository: repository, validator: new CriarAlertaValidator() }),
    listarAlertas: new ListarAlertasHandler({ alertaReaderRepository: repository }),
    atualizarOrcamento: new AtualizarOrcamentoHandler({ alertaUpdaterRepository: repository }),
    excluirAlerta: new ExcluirAlertaHandler({ alertaDeleterRepository: repository }),
  }
}

let application

// O worker do Azure é reaproveitado; assim a conexão Mongo também é reaproveitada.
export function getApplication() {
  application ??= buildApplication()
  return application
}
