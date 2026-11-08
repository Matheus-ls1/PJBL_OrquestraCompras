import { Router } from 'express';
import { createIdentityController } from '../controllers/identity-controller.js';
import { authenticate } from '../middleware/authenticate.js';

export function identityRouter(dependencies) {
  const router = Router();
  const controller = createIdentityController(dependencies);
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/profile', authenticate(dependencies), controller.getProfile);
  router.put('/profile', authenticate(dependencies), controller.updateProfile);
  router.put('/password', authenticate(dependencies), controller.changePassword);
  router.delete('/account', authenticate(dependencies), controller.requestClosure);
  return router;
}
