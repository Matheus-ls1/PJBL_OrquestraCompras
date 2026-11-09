import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { AggregateDataError } from '../src/application/features/aggregate-data/aggregate-data.js';

const bearer = 'Bearer jwt-de-teste';

function clients(identityProxy = async () => ({ status: 200, body: {} }), budgetProxy = async () => ({ status: 200, body: {} })) {
  return {
    identity: { getProfile: async () => ({ usuario: { id: 'u-1' } }), proxy: identityProxy },
    budget: { listBudgets: async () => ({ orcamentos: [] }), proxy: budgetProxy },
    monitoring: { calculateFinancialSummary: async () => ({ tipoAnalise: 'RESUMO_FINANCEIRO' }) }
  };
}

test('encaminha cadastro ao Identity sem Bearer e preserva HTTP 201', async () => {
  let forwarded;
  const app = createApp({ clients: clients(async input => { forwarded = input; return { status: 201, body: { usuario: { id: 'u-1' } } }; }) });
  const response = await request(app).post('/api/v1/auth/register').send({ nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-segura-123' });
  assert.equal(response.status, 201);
  assert.equal(forwarded.path, '/api/v1/auth/register');
  assert.equal(forwarded.authorization, undefined);
  assert.equal(forwarded.body.email, 'ana@exemplo.com');
});

test('encaminha login ao Identity e preserva resposta pública', async () => {
  const app = createApp({ clients: clients(async () => ({ status: 200, body: { token: 'token-de-resposta', usuario: { id: 'u-1' } } })) });
  const response = await request(app).post('/api/v1/auth/login').send({ email: 'ana@exemplo.com', senha: 'senha-segura-123' });
  assert.equal(response.status, 200);
  assert.equal(response.body.usuario.id, 'u-1');
});

test('exige Bearer antes de encaminhar perfil e orçamento', async () => {
  let calls = 0;
  const app = createApp({ clients: clients(async () => { calls++; return { status: 200, body: {} }; }, async () => { calls++; return { status: 200, body: {} }; }) });
  const profile = await request(app).get('/api/v1/auth/profile');
  const budget = await request(app).get('/api/v1/orcamentos');
  assert.equal(profile.status, 401);
  assert.equal(budget.status, 401);
  assert.equal(calls, 0);
});

test('encaminha criação, listagem e consulta individual de orçamento com Bearer', async () => {
  const paths = [];
  const app = createApp({ clients: clients(undefined, async input => { paths.push(input); return { status: input.method === 'POST' ? 201 : 200, body: input.method === 'GET' ? { orcamentos: [] } : { orcamento: { id: 'o-1' } } }; }) });
  const create = await request(app).post('/api/v1/orcamentos').set('Authorization', bearer).send({ nomeProjeto: 'Notebook', valorLimite: 4000 });
  const list = await request(app).get('/api/v1/orcamentos').set('Authorization', bearer);
  const get = await request(app).get('/api/v1/orcamentos/o-1').set('Authorization', bearer);
  assert.equal(create.status, 201);
  assert.equal(list.status, 200);
  assert.equal(get.status, 200);
  assert.deepEqual(paths.map(value => value.path), ['/api/v1/orcamentos', '/api/v1/orcamentos', '/api/v1/orcamentos/o-1']);
  assert.ok(paths.every(value => value.authorization === bearer));
});

test('preserva If-Match e HTTP 409 do Budget Service', async () => {
  let forwarded;
  const app = createApp({ clients: clients(undefined, async input => { forwarded = input; return { status: 409, body: { code: 'CONFLITO_VERSAO', message: 'Versão desatualizada.' } }; }) });
  const response = await request(app).put('/api/v1/orcamentos/o-1').set('Authorization', bearer).set('If-Match', '1').send({ valorLimite: 6000 });
  assert.equal(response.status, 409);
  assert.equal(response.body.code, 'CONFLITO_VERSAO');
  assert.equal(forwarded.ifMatch, '1');
});

test('preserva HTTP 204 sem corpo na exclusão lógica', async () => {
  const app = createApp({ clients: clients(undefined, async () => ({ status: 204, body: undefined })) });
  const response = await request(app).delete('/api/v1/orcamentos/o-1').set('Authorization', bearer).set('If-Match', '1');
  assert.equal(response.status, 204);
  assert.equal(response.text, '');
});

test('encaminha operações aninhadas de itens e lojas', async () => {
  const requests = [];
  const app = createApp({ clients: clients(undefined, async input => { requests.push(input); return { status: 200, body: { ok: true } }; }) });
  const payload = { categoria: 'CPU', descricaoRequisitos: '12 núcleos', opcoesAceitas: ['Ryzen 9'], obrigatorio: true };
  const item = await request(app).put('/api/v1/orcamentos/o-1/itens/i-1').set('Authorization', bearer).set('If-Match', '2').send(payload);
  await request(app).delete('/api/v1/orcamentos/o-1/lojas/l-1').set('Authorization', bearer).set('If-Match', '3');
  assert.equal(item.status, 200);
  assert.deepEqual(requests.map(value => value.path), ['/api/v1/orcamentos/o-1/itens/i-1', '/api/v1/orcamentos/o-1/lojas/l-1']);
  assert.equal(requests[0].authorization, bearer);
  assert.equal(requests[0].ifMatch, '2');
  assert.deepEqual(requests[0].body, payload);
});

test('converte indisponibilidade e timeout downstream em 502 e 504', async () => {
  const unavailable = createApp({ clients: clients(async () => { throw new AggregateDataError('Identity Service indisponível.', { status: 502 }); }) });
  const timeout = createApp({ clients: clients(async () => { throw new AggregateDataError('Identity Service excedeu o tempo limite.', { code: 'DEPENDENCIA_TIMEOUT', status: 504 }); }) });
  assert.equal((await request(unavailable).post('/api/v1/auth/login').send({})).status, 502);
  assert.equal((await request(timeout).post('/api/v1/auth/login').send({})).status, 504);
});

test('CORS aceita somente origem configurada', async () => {
  const app = createApp({ clients: clients(), corsAllowedOrigins: 'http://localhost:5173' });
  const allowed = await request(app).options('/api/v1/auth/login').set('Origin', 'http://localhost:5173');
  const denied = await request(app).options('/api/v1/auth/login').set('Origin', 'https://nao-autorizada.exemplo');
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(denied.status, 403);
});

test('OpenAPI descreve proxy, Bearer, parâmetros e If-Match', async () => {
  const { openApiDocument } = await import('../src/api/contracts/openapi.js');
  assert.ok(openApiDocument.paths['/api/v1/auth/login'].post.requestBody);
  assert.deepEqual(openApiDocument.paths['/api/v1/orcamentos'].get.security, [{ bearerAuth: [] }]);
  const update = openApiDocument.paths['/api/v1/orcamentos/{id}'].put;
  assert.equal(update.parameters[0].name, 'if-match');
  assert.equal(openApiDocument.paths['/api/v1/orcamentos/{id}/itens/{childId}'].parameters[1].name, 'childId');
});

test('encaminha análise e histórico de oportunidades somente com Bearer', async () => {
  const forwarded = [];
  const app = createApp({ clients: { ...clients(), monitoring: { calculateFinancialSummary: async () => ({}), proxy: async input => { forwarded.push(input); return { status: input.method === 'POST' ? 201 : 200, body: input.method === 'POST' ? { oportunidade: { decisao: 'COMPRAR_AGORA' } } : { oportunidades: [] } }; } } } });
  const denied = await request(app).post('/api/v1/monitoramento/orcamentos/o-1/analisar');
  const analyze = await request(app).post('/api/v1/monitoramento/orcamentos/o-1/analisar').set('Authorization', bearer);
  const history = await request(app).get('/api/v1/monitoramento/oportunidades/o-1').set('Authorization', bearer);
  assert.equal(denied.status, 401); assert.equal(analyze.status, 201); assert.equal(history.status, 200);
  assert.deepEqual(forwarded.map(value => value.path), ['/api/v1/monitoramento/orcamentos/o-1/analisar', '/api/v1/monitoramento/oportunidades/o-1']);
});
