import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateRequest } from '../src/api/jwt.js';

test('diferencia Monitoring sem JWT_SECRET de Bearer ausente ou inválido', () => {
  const request = { headers: new Headers() };
  assert.throws(() => authenticateRequest(request, ''), error => error.status === 503 && error.code === 'MONITORING_AUTH_NOT_CONFIGURED');
  assert.throws(() => authenticateRequest(request, 'segredo'), error => error.status === 401 && error.code === 'TOKEN_AUSENTE');
  const malformed = { headers: new Headers({ authorization: 'Bearer invalido' }) };
  assert.throws(() => authenticateRequest(malformed, 'segredo'), error => error.status === 401 && error.code === 'TOKEN_INVALIDO');
});
