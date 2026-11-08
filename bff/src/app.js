import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './api/routes/health-routes.js';
import { aggregatedDataRouter } from './api/routes/aggregated-data-routes.js';
import { openApiDocument } from './api/contracts/openapi.js';
import { createAggregateData } from './application/features/aggregate-data/aggregate-data.js';
import { createServiceClients } from './infrastructure/http/service-clients.js';
import { errorHandler, notFoundHandler } from './api/middleware/error-handler.js';

export function createApp(overrides = {}) {
  const aggregateData = overrides.aggregateData || createAggregateData({
    clients: overrides.clients || createServiceClients(overrides.config)
  });
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/aggregated-data', aggregatedDataRouter({ aggregateData }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
