import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { createBudgetService } from './api/budget-service.js';
import { App } from './App.jsx';
import { BudgetError } from './api/budget-service.js';

it('consulta e solicita análise de oportunidades exclusivamente pelo BFF', async () => {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ oportunidades: [] }), { status: 200, headers: { 'content-type': 'application/json' } }));
  const service = createBudgetService(fetchImpl);
  await service.listOpportunities('jwt', 'orcamento-1');
  await service.analyzeOpportunities('jwt', 'orcamento-1');
  expect(fetchImpl.mock.calls[0][0]).toContain('/api/v1/monitoramento/oportunidades/orcamento-1');
  expect(fetchImpl.mock.calls[1][0]).toContain('/api/v1/monitoramento/orcamentos/orcamento-1/analisar');
  expect(fetchImpl.mock.calls[1][1].method).toBe('POST');
  expect(fetchImpl.mock.calls[1][1].headers.Authorization).toBe('Bearer jwt');
});

it('falha auxiliar de oportunidades não invalida a sessão do orçamento', async () => {
  const budget = { id: 'o-1', nomeProjeto: 'Computador', valorLimite: 5000, status: 'MONITORANDO', versao: 1, itensDesejados: [], lojasAutorizadas: [] };
  const service = { list: vi.fn(async () => ({ orcamentos: [budget] })), get: vi.fn(async () => ({ orcamento: budget })), listOpportunities: vi.fn(async () => { throw new BudgetError('Monitoring indisponível.', 401, 'TOKEN_INVALIDO'); }), analyzeOpportunities: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), addStore: vi.fn(), updateStore: vi.fn(), removeStore: vi.fn() };
  const onSessionInvalid = vi.fn(); render(<App accessToken="jwt-valido" service={service} onSessionInvalid={onSessionInvalid} />);
  fireEvent.click(await screen.findByText('Visualizar e editar'));
  expect(await screen.findByText('Computador')).toBeTruthy();
  await waitFor(() => expect(service.listOpportunities).toHaveBeenCalled());
  expect(onSessionInvalid).not.toHaveBeenCalled();
});
