import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { AggregateDataError } from '../src/application/features/aggregate-data/aggregate-data.js';
import { createServiceClients } from '../src/infrastructure/http/service-clients.js';

const bearer = 'Bearer jwt-de-teste';

function clients(overrides = {}) {
  return {
    identity: { getProfile: async authorization => ({ usuario: { id: 'usuario-1', nome: 'Ada' }, authorization }), ...overrides.identity },
    budget: { listBudgets: async authorization => ({ orcamentos: [{ id: 'o-1', valorLimite: 5000 }, { id: 'o-2', valorLimite: 3000 }], authorization }), ...overrides.budget },
    monitoring: { calculateFinancialSummary: async input => ({ totalOrcamentos: input.orcamentos.length, somaLimites: 8000, mediaLimites: 4000, origem: 'azure-function', tipoAnalise: 'RESUMO_FINANCEIRO' }), ...overrides.monitoring }
  };
}

test('GET /aggregated-data reúne as três respostas e encaminha o JWT', async () => {
  let monitoringInput;
  const dependencyClients = clients({ monitoring: { calculateFinancialSummary: async input => { monitoringInput = input; return { totalOrcamentos: 2, somaLimites: 8000, mediaLimites: 4000, origem: 'azure-function', tipoAnalise: 'RESUMO_FINANCEIRO' }; } } });
  const response = await request(createApp({ clients: dependencyClients })).get('/aggregated-data').set('Authorization', bearer);

  assert.equal(response.status, 200);
  assert.equal(response.body.usuario.id, 'usuario-1');
  assert.equal(response.body.orcamentos.length, 2);
  assert.deepEqual(monitoringInput, { orcamentos: [{ valorLimite: 5000 }, { valorLimite: 3000 }] });
  assert.equal(response.body.resumoFinanceiro.origem, 'azure-function');
});

test('rejeita JWT ausente antes de chamar dependências', async () => {
  const response = await request(createApp({ clients: clients() })).get('/aggregated-data');
  assert.equal(response.status, 401);
  assert.equal(response.body.code, 'TOKEN_AUSENTE');
});

for (const [nome, dependency, expectedStatus] of [
  ['Identity Service', 'identity', 502],
  ['Budget Service', 'budget', 502],
  ['Azure Function', 'monitoring', 502],
  ['timeout de dependência', 'monitoring', 504]
]) {
  test(`retorna falha controlada para ${nome}`, async () => {
    const error = new AggregateDataError('Dependência indisponível.', { code: expectedStatus === 504 ? 'DEPENDENCIA_TIMEOUT' : 'DEPENDENCIA_INDISPONIVEL', status: expectedStatus });
    const dependencyClients = clients({ [dependency]: dependency === 'monitoring' ? { calculateFinancialSummary: async () => { throw error; } } : dependency === 'identity' ? { getProfile: async () => { throw error; } } : { listBudgets: async () => { throw error; } } });
    const response = await request(createApp({ clients: dependencyClients })).get('/aggregated-data').set('Authorization', bearer);
    assert.equal(response.status, expectedStatus);
    assert.equal(response.body.code, error.code);
  });
}

test('lista vazia produz resumo real da Function', async () => {
  const dependencyClients = clients({ budget: { listBudgets: async () => ({ orcamentos: [] }) }, monitoring: { calculateFinancialSummary: async input => ({ totalOrcamentos: input.orcamentos.length, somaLimites: 0, mediaLimites: 0, origem: 'azure-function', tipoAnalise: 'RESUMO_FINANCEIRO' }) } });
  const response = await request(createApp({ clients: dependencyClients })).get('/aggregated-data').set('Authorization', bearer);
  assert.equal(response.status, 200);
  assert.equal(response.body.resumoFinanceiro.totalOrcamentos, 0);
});

test('não inclui orçamento logicamente excluído na resposta nem no cálculo', async () => {
  let input;
  const dependencyClients = clients({
    budget: { listBudgets: async () => ({ orcamentos: [{ id: 'ativo', valorLimite: 10 }, { id: 'excluido', valorLimite: 999, excluidoEm: '2026-11-08T00:00:00.000Z' }] }) },
    monitoring: { calculateFinancialSummary: async value => { input = value; return { totalOrcamentos: 1, somaLimites: 10, mediaLimites: 10, origem: 'azure-function', tipoAnalise: 'RESUMO_FINANCEIRO' }; } }
  });
  const response = await request(createApp({ clients: dependencyClients })).get('/aggregated-data').set('Authorization', bearer);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.orcamentos.map(item => item.id), ['ativo']);
  assert.deepEqual(input, { orcamentos: [{ valorLimite: 10 }] });
});

test('OpenAPI documenta Bearer, fontes e erros da agregação', async () => {
  const { openApiDocument } = await import('../src/api/contracts/openapi.js');
  const operation = openApiDocument.paths['/aggregated-data'].get;
  assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
  assert.ok(operation.responses[200]);
  assert.ok(operation.responses[401]);
  assert.ok(operation.responses[502]);
  assert.ok(operation.responses[504]);
});

test('caso de uso não depende de Express nem de clientes HTTP', async () => {
  const source = await readFile(new URL('../src/application/features/aggregate-data/aggregate-data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /express|fetch\(/i);
});

test('clientes HTTP usam contratos reais, Bearer encaminhado e chave de Function somente no backend', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ usuario: { id: 'u-1' }, orcamentos: [], totalOrcamentos: 0, somaLimites: 0, mediaLimites: 0, origem: 'azure-function', tipoAnalise: 'RESUMO_FINANCEIRO' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const httpClients = createServiceClients({ fetchImpl, identityServiceUrl: 'http://identity.local', budgetServiceUrl: 'http://budget.local', monitoringServiceUrl: 'http://function.local', functionKey: 'chave-apenas-de-teste', timeoutMs: 100 });

  await httpClients.identity.getProfile(bearer);
  await httpClients.budget.listBudgets(bearer);
  await httpClients.monitoring.calculateFinancialSummary({ orcamentos: [] });

  assert.equal(calls[0].url, 'http://identity.local/api/v1/auth/profile');
  assert.equal(calls[1].url, 'http://budget.local/api/v1/orcamentos');
  assert.equal(calls[2].url, 'http://function.local/api/v1/monitoramento/resumo-financeiro');
  assert.equal(calls[0].options.headers.authorization, bearer);
  assert.equal(calls[1].options.headers.authorization, bearer);
  assert.equal(calls[2].options.headers['x-functions-key'], 'chave-apenas-de-teste');
});

test('cliente HTTP converte AbortController em timeout seguro', async () => {
  const fetchImpl = (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(Object.assign(new Error('abortado'), { name: 'AbortError' }))));
  const httpClients = createServiceClients({ fetchImpl, timeoutMs: 5 });
  await assert.rejects(() => httpClients.identity.getProfile(bearer), error => error instanceof AggregateDataError && error.status === 504 && error.code === 'DEPENDENCIA_TIMEOUT');
});
