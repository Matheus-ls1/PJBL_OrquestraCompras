import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './api/routes/health-routes.js';
import { aggregatedDataRouter } from './api/routes/aggregated-data-routes.js';
import { identityProxyRouter } from './api/routes/identity-proxy-routes.js';
import { budgetProxyRouter } from './api/routes/budget-proxy-routes.js';
import { monitoringProxyRouter } from './api/routes/monitoring-proxy-routes.js';
import { openApiDocument } from './api/contracts/openapi.js';
import { createAggregateData } from './application/features/aggregate-data/aggregate-data.js';
import { createServiceClients } from './infrastructure/http/service-clients.js';
import { errorHandler, notFoundHandler } from './api/middleware/error-handler.js';
import { createCorsMiddleware } from './api/middleware/cors.js';

export function createApp(overrides = {}) {
  const clients = overrides.clients || createServiceClients(overrides.config);
  const aggregateData = overrides.aggregateData || createAggregateData({
    clients
  });
  const app = express();
  app.disable('x-powered-by');
  app.use(createCorsMiddleware(overrides.corsAllowedOrigins));
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/aggregated-data', aggregatedDataRouter({ aggregateData }));
  app.use('/api/v1/auth', identityProxyRouter({ proxy: clients.identity.proxy }));
  app.use('/api/v1/orcamentos', budgetProxyRouter({ proxy: clients.budget.proxy }));
  app.use('/api/v1/monitoramento', monitoringProxyRouter({ proxy: clients.monitoring.proxy }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
