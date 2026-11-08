import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthRouter } from './api/routes/health-routes.js';
import { identityRouter } from './api/routes/identity-routes.js';
import { openApiDocument } from './api/contracts/openapi.js';
import { createIdentityDependencies } from './infrastructure/container.js';
import { errorHandler, notFoundHandler } from './api/middleware/error-handler.js';

export function createApp(overrides = {}) {
  const dependencies = createIdentityDependencies(overrides);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use('/health', healthRouter);
  app.get('/readiness', async (_request, response, next) => {
    try {
      await dependencies.userRepository.ping();
      response.status(200).json({ status: 'ready', service: 'identity-service', dependency: 'mongodb' });
    } catch (error) {
      response.status(503).json({ status: 'not-ready', service: 'identity-service', dependency: 'mongodb', code: error.code || 'MONGODB_UNAVAILABLE' });
    }
  });
  app.use('/api/v1/auth', identityRouter(dependencies));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
