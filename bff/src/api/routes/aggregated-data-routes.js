import { Router } from 'express';
import { createAggregatedDataController } from '../controllers/aggregated-data-controller.js';

export function aggregatedDataRouter(dependencies) {
  const router = Router();
  router.get('/', createAggregatedDataController(dependencies));
  return router;
}
