export class AggregateDataError extends Error {
  constructor(message, { code = 'DEPENDENCIA_INDISPONIVEL', status = 502 } = {}) {
    super(message);
    this.name = 'AggregateDataError';
    this.code = code;
    this.status = status;
  }
}

function isActiveBudget(orcamento) {
  return !orcamento?.excluidoEm && !orcamento?.excluido_em;
}

function isValidLimit(orcamento) {
  return typeof orcamento?.valorLimite === 'number' && Number.isFinite(orcamento.valorLimite) && orcamento.valorLimite >= 0;
}

export function createAggregateData({ clients }) {
  return async function aggregateData(authorization) {
    const perfil = await clients.identity.getProfile(authorization);
    const budgetResponse = await clients.budget.listBudgets(authorization);

    if (!perfil || typeof perfil !== 'object' || !perfil.usuario || !Array.isArray(budgetResponse?.orcamentos)) {
      throw new AggregateDataError('Uma dependência retornou um contrato inválido.', { code: 'CONTRATO_DEPENDENCIA_INVALIDO' });
    }

    const orcamentos = budgetResponse.orcamentos.filter(isActiveBudget);
    const resumoFinanceiro = await clients.monitoring.calculateFinancialSummary({
      orcamentos: orcamentos.filter(isValidLimit).map(({ valorLimite }) => ({ valorLimite }))
    });

    if (!resumoFinanceiro || typeof resumoFinanceiro !== 'object' || resumoFinanceiro.tipoAnalise !== 'RESUMO_FINANCEIRO') {
      throw new AggregateDataError('A Function retornou um contrato inválido.', { code: 'CONTRATO_DEPENDENCIA_INVALIDO' });
    }

    return { usuario: perfil.usuario, orcamentos, resumoFinanceiro };
  };
}
