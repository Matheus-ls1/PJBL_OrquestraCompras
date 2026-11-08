import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './api/routes/health-routes.js';
import { openApiDocument } from './api/contracts/openapi.js';
import { dependencies } from './infrastructure/container.js';
import { budgetRouter } from './api/routes/budget-routes.js';
import { errorHandler } from './api/middleware/error-handler.js';

export function createApp(overrides = {}) {
  const deps = dependencies(overrides);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use('/health', healthRouter);
  app.get('/readiness', async (_req,res) => { try { await deps.repository.ping(); res.json({status:'ready',service:'budget-service',dependency:'azure-sql'}); } catch(error) { res.status(503).json({status:'not-ready',service:'budget-service',dependency:'azure-sql',code:error.code||'SQL_UNAVAILABLE'}); } });
  app.use('/api/v1/orcamentos', budgetRouter(deps));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(errorHandler);
  return app;
}
