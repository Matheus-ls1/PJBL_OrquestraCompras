import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarEventoOrcamentoV1 } from '../src/domain/evento-orcamento.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const settingsPath = resolve(root, 'local.settings.json');
export const eventPath = resolve(root, '.queue-test', 'evento-orcamento-v1.json');

export async function loadSafeQueueTestSettings(read = readFile) {
  const parsed = JSON.parse(await read(settingsPath, 'utf8'));
  const values = parsed?.Values || {};
  if (values.AzureWebJobsStorage !== 'UseDevelopmentStorage=true') throw new Error('Teste bloqueado: AzureWebJobsStorage deve ser exatamente UseDevelopmentStorage=true.');
  if (values.ORCAMENTOS_EVENTOS_QUEUE_NAME !== 'orcamentos-eventos-teste') throw new Error('Teste bloqueado: ORCAMENTOS_EVENTOS_QUEUE_NAME deve ser exatamente orcamentos-eventos-teste.');
  if (values.MONGODB_MONITORING_DATABASE !== 'db_monitoring_test') throw new Error('Teste bloqueado: MONGODB_MONITORING_DATABASE deve ser exatamente db_monitoring_test.');
  if (typeof values.MONGODB_MONITORING_URI !== 'string' || !values.MONGODB_MONITORING_URI.trim()) throw new Error('MONGODB_MONITORING_URI é obrigatória para verificar o teste.');
  return values;
}

export function createSyntheticEvent(now = new Date()) {
  const eventId = randomUUID(); const orcamentoId = randomUUID(); const usuarioId = `teste-queue-${randomUUID()}`; const timestamp = now.toISOString();
  return validarEventoOrcamentoV1({ eventId, tipo: 'EventoOrcamentoV1', acao: 'OrcamentoCriado', orcamentoId, usuarioId, versaoEvento: 1, dataOcorrencia: timestamp, snapshot: { id: orcamentoId, usuarioId, nomeProjeto: 'EVENTO_SINTETICO_QUEUE_TESTE', valorLimite: 1234.56, status: 'RASCUNHO', versao: 1, criadoEm: timestamp, atualizadoEm: timestamp, itensDesejados: [{ id: randomUUID(), categoria: 'TESTE_LOCAL', descricaoRequisitos: 'Evento sintético para validação local', opcoesAceitas: ['OPCAO_TESTE'], obrigatorio: true }], lojasAutorizadas: [{ id: randomUUID(), nome: 'Loja Sintética Local', urlBase: 'https://teste.local.invalid', confiavel: true, ativa: true }] } });
}

export async function loadOrCreateSyntheticEvent({ read = readFile, write = writeFile, makeDir = mkdir } = {}) {
  try { return validarEventoOrcamentoV1(JSON.parse(await read(eventPath, 'utf8'))); } catch (error) { if (error.code !== 'ENOENT') throw error; const event = createSyntheticEvent(); await makeDir(dirname(eventPath), { recursive: true }); await write(eventPath, `${JSON.stringify(event, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' }); return event; }
}

export async function loadExistingSyntheticEvent(read = readFile) {
  return validarEventoOrcamentoV1(JSON.parse(await read(eventPath, 'utf8')));
}
