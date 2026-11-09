import { app } from '@azure/functions';
import { createMongoMonitoringCollectionRepository } from '../infrastructure/persistence/mongo-monitoring-collection-repository.js';
import { createMockCatalogAdapter } from '../infrastructure/catalog/mock-catalog-adapter.js';
import { createColetarOfertasUseCase } from '../application/coletar-ofertas/coletar-ofertas.js';
import { createAnalisarOportunidadesUseCase } from '../application/analisar-oportunidades/analisar-oportunidades.js';
import { createGeminiAiEngineAdapter, createMockAiEngineAdapter } from '../infrastructure/ai/ai-engine-adapter.js';
import { authenticateRequest } from '../api/jwt.js';
const repository = createMongoMonitoringCollectionRepository({ uri: process.env.MONGODB_MONITORING_URI, database: process.env.MONGODB_MONITORING_DATABASE || 'db_monitoring' });
const coleta = createColetarOfertasUseCase({ repository, catalogAdapter: createMockCatalogAdapter(), timeoutMs: Number(process.env.MONITORING_CATALOG_TIMEOUT_MS || 5000), concurrency: Number(process.env.MONITORING_COLLECTION_CONCURRENCY || 2) });
const ai = createGeminiAiEngineAdapter({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL }) || createMockAiEngineAdapter();
const useCase = createAnalisarOportunidadesUseCase({ repository, coletarOfertas: coleta, aiEngine: ai });
export function createOportunidadesHttpHandler({ analisar = useCase, authenticate = authenticateRequest } = {}) { return async request => { try { const { usuarioId } = authenticate(request); const id = request.params.id; if (request.method === 'POST') return { status: 201, jsonBody: { oportunidade: await analisar.execute({ orcamentoId: id, usuarioId }) } }; return { status: 200, jsonBody: { oportunidades: await analisar.list({ usuarioId, orcamentoId: id || undefined }) } }; } catch (error) { return { status: error.status || 500, jsonBody: { code: error.code || 'ERRO_INTERNO', message: error.status ? error.message : 'Não foi possível analisar oportunidades.' } }; } }; }
export const oportunidadesHttp = createOportunidadesHttpHandler();
app.http('analisarOportunidades', { methods: ['POST'], authLevel: 'function', route: 'v1/monitoramento/orcamentos/{id}/analisar', handler: oportunidadesHttp });
app.http('listarOportunidades', { methods: ['GET'], authLevel: 'function', route: 'v1/monitoramento/oportunidades/{id?}', handler: oportunidadesHttp });
