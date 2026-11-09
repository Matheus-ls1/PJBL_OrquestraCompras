import { Router } from 'express';
import { createProxyController } from '../controllers/proxy-controller.js';
export function monitoringProxyRouter({ proxy }) { const router = Router(); router.use(createProxyController({ proxy, requiresAuth: true })); return router; }
