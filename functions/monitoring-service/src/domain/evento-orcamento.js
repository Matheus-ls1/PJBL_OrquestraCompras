const actions = new Set(['OrcamentoCriado', 'OrcamentoAtualizado', 'OrcamentoPausado', 'OrcamentoExcluido', 'ItemAdicionado', 'ItemAtualizado', 'ItemRemovido', 'LojaAdicionada', 'LojaAtualizada', 'LojaRemovida']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses = new Set(['RASCUNHO', 'MONITORANDO', 'PAUSADO', 'ALERTA_DISPARADO', 'CONCLUIDO', 'EXPIRADO']);
export class ErroEventoOrcamentoInvalido extends Error { constructor(message) { super(message); this.name = 'ErroEventoOrcamentoInvalido'; this.code = 'EVENTO_ORCAMENTO_INVALIDO'; } }
export function validarEventoOrcamentoV1(evento) {
  if (!evento || typeof evento !== 'object' || Array.isArray(evento)) throw new ErroEventoOrcamentoInvalido('A mensagem deve conter um objeto JSON.');
  if (typeof evento.eventId !== 'string' || !uuid.test(evento.eventId)) throw new ErroEventoOrcamentoInvalido('eventId deve ser um UUID válido.');
  if (evento.tipo !== 'EventoOrcamentoV1') throw new ErroEventoOrcamentoInvalido('tipo deve ser EventoOrcamentoV1.');
  if (!actions.has(evento.acao)) throw new ErroEventoOrcamentoInvalido('acao não é reconhecida para EventoOrcamentoV1.');
  if (typeof evento.orcamentoId !== 'string' || !uuid.test(evento.orcamentoId)) throw new ErroEventoOrcamentoInvalido('orcamentoId deve ser um UUID válido.');
  if (typeof evento.usuarioId !== 'string' || !evento.usuarioId.trim()) throw new ErroEventoOrcamentoInvalido('usuarioId é obrigatório.');
  if (!Number.isInteger(evento.versaoEvento) || evento.versaoEvento < 1) throw new ErroEventoOrcamentoInvalido('versaoEvento deve ser um inteiro positivo.');
  if (typeof evento.dataOcorrencia !== 'string' || Number.isNaN(Date.parse(evento.dataOcorrencia))) throw new ErroEventoOrcamentoInvalido('dataOcorrencia deve ser uma data ISO válida.');
  if (!evento.snapshot || typeof evento.snapshot !== 'object' || Array.isArray(evento.snapshot)) throw new ErroEventoOrcamentoInvalido('snapshot deve ser um objeto.');
  if (evento.snapshot.id !== evento.orcamentoId || evento.snapshot.usuarioId !== evento.usuarioId || evento.snapshot.versao !== evento.versaoEvento) throw new ErroEventoOrcamentoInvalido('snapshot não corresponde à identidade ou versão do evento.');
  if (!statuses.has(evento.snapshot.status)) throw new ErroEventoOrcamentoInvalido('snapshot.status não é um estado de orçamento válido.');
  if (!(Number(evento.snapshot.valorLimite) > 0)) throw new ErroEventoOrcamentoInvalido('snapshot.valorLimite deve ser positivo.');
  if (!Array.isArray(evento.snapshot.itensDesejados) || !Array.isArray(evento.snapshot.lojasAutorizadas)) throw new ErroEventoOrcamentoInvalido('snapshot deve conter itensDesejados e lojasAutorizadas.');
  return evento;
}
export function parseEventoOrcamentoV1(queueItem) {
  if (typeof queueItem === 'string') {
    try { return validarEventoOrcamentoV1(JSON.parse(queueItem)); } catch (error) { if (error instanceof ErroEventoOrcamentoInvalido) throw error; throw new ErroEventoOrcamentoInvalido('A mensagem da fila não contém JSON válido.'); }
  }
  if (queueItem && typeof queueItem === 'object' && !Array.isArray(queueItem) && (Object.getPrototypeOf(queueItem) === Object.prototype || Object.getPrototypeOf(queueItem) === null)) return validarEventoOrcamentoV1(queueItem);
  throw new ErroEventoOrcamentoInvalido('A mensagem da fila deve ser JSON em texto ou objeto simples.');
}
