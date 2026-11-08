import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

class Repository { constructor() { this.created = []; } async ping() {} async create(budget, event) { this.created.push({ budget, event }); } async list(userId) { return this.created.map(x => x.budget).filter(x => x.usuarioId === userId); } async get() { return null; } }
const body = { nomeProjeto: 'Projeto JWT', valorLimite: 1000 };

test('aceita JWT HS256 no formato emitido pelo Identity e usa sub como usuário', async () => {
  const repository = new Repository();
  const secret = 'segredo-compartilhado-de-teste';
  const identityFormatToken = jwt.sign({ sub: 'usuario-do-identity', email: 'nao-expor@example.test', revogacaoEm: null }, secret, { expiresIn: '15m' });
  const app = createApp({ repository, secret, id: () => '00000000-0000-4000-8000-000000000001' });
  const response = await request(app).post('/api/v1/orcamentos').set('Authorization', `Bearer ${identityFormatToken}`).send(body);
  assert.equal(response.status, 201);
  assert.equal(repository.created[0].budget.usuarioId, 'usuario-do-identity');
  assert.equal(repository.created[0].event.versaoEvento, 1);
});

test('gerador de identificadores padrão não perde o contexto nativo', async () => {
  const repository = new Repository();
  const app = createApp({ repository, secret: 'segredo-compartilhado-de-teste' });
  const token = jwt.sign({ sub: 'usuario-padrao' }, 'segredo-compartilhado-de-teste', { expiresIn: '15m' });
  const response = await request(app).post('/api/v1/orcamentos').set('Authorization', `Bearer ${token}`).send(body);
  assert.equal(response.status, 201);
  assert.match(repository.created[0].budget.id, /^[0-9a-f-]{36}$/i);
});

test('rejeita JWT expirado, segredo divergente e ausência de token', async () => {
  const app = createApp({ repository: new Repository(), secret: 'segredo-correto' });
  const expired = jwt.sign({ sub: 'u' }, 'segredo-correto', { expiresIn: -1 });
  const foreign = jwt.sign({ sub: 'u' }, 'segredo-diferente', { expiresIn: '15m' });
  for (const token of [expired, foreign]) assert.equal((await request(app).post('/api/v1/orcamentos').set('Authorization', `Bearer ${token}`).send(body)).status, 401);
  assert.equal((await request(app).post('/api/v1/orcamentos').send(body)).status, 401);
});

test('diferencia JWT_SECRET ausente de token inválido', async () => {
  const app = createApp({ repository: new Repository(), secret: '' });
  const response = await request(app).post('/api/v1/orcamentos').send(body);
  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'CONFIGURACAO_INCOMPLETA');
});
