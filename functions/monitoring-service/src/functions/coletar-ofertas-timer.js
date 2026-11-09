import { app } from '@azure/functions';
import { createColetarOfertasUseCase } from '../application/coletar-ofertas/coletar-ofertas.js';
import { createMockCatalogAdapter } from '../infrastructure/catalog/mock-catalog-adapter.js';
import { createMongoMonitoringCollectionRepository } from '../infrastructure/persistence/mongo-monitoring-collection-repository.js';

const repository = createMongoMonitoringCollectionRepository({ uri: process.env.MONGODB_MONITORING_URI, database: process.env.MONGODB_MONITORING_DATABASE || 'db_monitoring' });
const useCase = createColetarOfertasUseCase({ repository, catalogAdapter: createMockCatalogAdapter(), timeoutMs: Number(process.env.MONITORING_CATALOG_TIMEOUT_MS || 5000), concurrency: Number(process.env.MONITORING_COLLECTION_CONCURRENCY || 2) });
export function createColetarOfertasTimerHandler({ timerUseCase, logger = console, enabled = process.env.MONITORING_COLLECTION_ENABLED === 'true' }) { return async function coletarOfertasTimer() { if (!enabled) { logger.log({ enabled: false }, 'Coleta de ofertas desabilitada por configuração.'); return; } const result = await timerUseCase.executeBatch({ limit: Number(process.env.MONITORING_COLLECTION_BATCH_SIZE || 20) }); logger.log({ processed: result.processed }, 'Coleta de ofertas mock concluída.'); }; }
export const coletarOfertasTimer = createColetarOfertasTimerHandler({ timerUseCase: useCase });
app.timer('coletarOfertas', { schedule: process.env.MONITORING_COLLECTION_SCHEDULE || '0 */15 * * * *', handler: coletarOfertasTimer });
