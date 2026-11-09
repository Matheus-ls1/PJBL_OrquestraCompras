import { app } from '@azure/functions';
import { createProcessarEventoOrcamentoUseCase } from '../application/processar-evento-orcamento/processar-evento-orcamento.js';
import { createMongoEventosMonitoramentoRepository } from '../infrastructure/persistence/mongo-eventos-monitoramento-repository.js';
const repository = createMongoEventosMonitoramentoRepository({ uri: process.env.MONGODB_MONITORING_URI, database: process.env.MONGODB_MONITORING_DATABASE || 'db_monitoring' });
const useCase = createProcessarEventoOrcamentoUseCase({ repository });
export function createProcessarEventoOrcamentoQueueHandler({ useCase: queueUseCase }) {
  return async function processarEventoOrcamentoQueue(queueItem, context) { try { const result = await queueUseCase.execute(queueItem); context.log({ eventId: result.eventId, duplicate: result.duplicate }, 'EventoOrcamentoV1 processado.'); } catch (error) { context.error({ code: error.code || 'QUEUE_EVENT_PROCESS_FAILED' }, 'Falha ao processar EventoOrcamentoV1; o runtime fará retry ou enviará à poison queue.'); throw error; } };
}
export const processarEventoOrcamentoQueue = createProcessarEventoOrcamentoQueueHandler({ useCase });
app.storageQueue('processarEventoOrcamento', { queueName: process.env.ORCAMENTOS_EVENTOS_QUEUE_NAME || 'orcamentos-eventos', connection: 'AzureWebJobsStorage', handler: processarEventoOrcamentoQueue });
