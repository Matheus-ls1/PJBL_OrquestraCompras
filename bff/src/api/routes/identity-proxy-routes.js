import { Router } from 'express';
import { createProxyController } from '../controllers/proxy-controller.js';

export function identityProxyRouter({ proxy }) {
  const router = Router();
  const publicProxy = createProxyController({ proxy, requiresAuth: false });
  const protectedProxy = createProxyController({ proxy, requiresAuth: true });
  router.post('/register', publicProxy);
  router.post('/login', publicProxy);
  router.get('/profile', protectedProxy);
  router.put('/profile', protectedProxy);
  router.put('/password', protectedProxy);
  router.delete('/account', protectedProxy);
  return router;
}
