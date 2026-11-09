const statuses = new Set(['RASCUNHO', 'MONITORANDO', 'PAUSADO', 'ALERTA_DISPARADO', 'CONCLUIDO', 'EXPIRADO']);

export function normalizeBudgetId(value) {
  return String(value).toLowerCase();
}

const copyItem = item => ({ ...item, opcoesAceitas: Array.isArray(item.opcoesAceitas) ? [...item.opcoesAceitas] : [] });
const copyStore = store => ({ ...store });

export function materializarAssinatura(evento, atual) {
  if (atual?.versaoEvento >= evento.versaoEvento) return { applied: false, reason: 'VERSAO_OBSOLETA' };
  if (atual?.excluidoEm) return { applied: false, reason: 'TOMBSTONE' };
  const snapshot = evento.snapshot;
  const excluidoEm = evento.acao === 'OrcamentoExcluido' ? (snapshot.excluidoEm || evento.dataOcorrencia) : null;
  return {
    applied: true,
    assinatura: {
      orcamentoId: normalizeBudgetId(evento.orcamentoId),
      usuarioId: evento.usuarioId,
      versaoEvento: evento.versaoEvento,
      status: snapshot.status,
      valorLimite: Number(snapshot.valorLimite),
      itensSnapshot: (snapshot.itensDesejados || []).map(copyItem),
      lojasSnapshot: (snapshot.lojasAutorizadas || []).map(copyStore),
      atualizadoEm: snapshot.atualizadoEm || evento.dataOcorrencia,
      ativoParaMonitoramento: !excluidoEm && snapshot.status === 'MONITORANDO',
      excluidoEm: excluidoEm || null
    }
  };
}

export function isBudgetStatus(value) { return statuses.has(value); }
