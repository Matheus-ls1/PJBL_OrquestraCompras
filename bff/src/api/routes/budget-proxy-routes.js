import { Router } from 'express';
import { createProxyController } from '../controllers/proxy-controller.js';

export function budgetProxyRouter({ proxy }) {
  const router = Router();
  const protectedProxy = createProxyController({ proxy, requiresAuth: true });
  router.use(protectedProxy);
  return router;
}
