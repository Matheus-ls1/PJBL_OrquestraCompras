import assert from 'node:assert/strict';
import test from 'node:test';
import { resumoFinanceiroHttp } from '../src/functions/resumo-financeiro-http.js';

test('adaptador HTTP responde o contrato para JSON válido', async () => {
  const resposta = await resumoFinanceiroHttp({
    json: async () => ({ orcamentos: [{ valorLimite: 5000 }, { valorLimite: 3000 }] })
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.jsonBody, {
    totalOrcamentos: 2,
    somaLimites: 8000,
    mediaLimites: 4000,
    origem: 'azure-function',
    tipoAnalise: 'RESUMO_FINANCEIRO'
  });
});

test('adaptador HTTP retorna 400 para JSON malformado', async () => {
  const resposta = await resumoFinanceiroHttp({ json: async () => { throw new SyntaxError('malformado'); } });
  assert.equal(resposta.status, 400);
  assert.equal(resposta.jsonBody.code, 'CORPO_JSON_INVALIDO');
});
