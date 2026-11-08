import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { calcularResumoFinanceiro, ErroValidacaoResumoFinanceiro } from '../src/domain/resumo-financeiro.js';

test('calcula resumo de dois orçamentos', () => {
  assert.deepEqual(calcularResumoFinanceiro([{ valorLimite: 5000 }, { valorLimite: 3000 }]), {
    totalOrcamentos: 2,
    somaLimites: 8000,
    mediaLimites: 4000,
    origem: 'azure-function',
    tipoAnalise: 'RESUMO_FINANCEIRO'
  });
});

test('calcula lista vazia sem divisão por zero', () => {
  assert.deepEqual(calcularResumoFinanceiro([]), {
    totalOrcamentos: 0,
    somaLimites: 0,
    mediaLimites: 0,
    origem: 'azure-function',
    tipoAnalise: 'RESUMO_FINANCEIRO'
  });
});

test('rejeita limite negativo e valores inválidos', () => {
  assert.throws(() => calcularResumoFinanceiro([{ valorLimite: -0.01 }]), ErroValidacaoResumoFinanceiro);
  assert.throws(() => calcularResumoFinanceiro([{ valorLimite: Number.NaN }]), ErroValidacaoResumoFinanceiro);
  assert.throws(() => calcularResumoFinanceiro([{ valorLimite: '5000' }]), ErroValidacaoResumoFinanceiro);
});

test('normaliza soma e média monetárias para duas casas decimais', () => {
  const resumo = calcularResumoFinanceiro([{ valorLimite: 10.105 }, { valorLimite: 10.105 }, { valorLimite: 10.105 }]);
  assert.equal(resumo.somaLimites, 30.33);
  assert.equal(resumo.mediaLimites, 10.11);
});

test('domínio não depende do SDK do Azure', async () => {
  const codigo = await readFile(new URL('../src/domain/resumo-financeiro.js', import.meta.url), 'utf8');
  assert.doesNotMatch(codigo, /@azure\/functions/);
});
