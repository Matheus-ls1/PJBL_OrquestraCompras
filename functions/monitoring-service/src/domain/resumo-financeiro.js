export class ErroValidacaoResumoFinanceiro extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroValidacaoResumoFinanceiro';
  }
}

function paraCentavos(valor) {
  return Math.round((valor + Number.EPSILON) * 100);
}

function paraMoeda(centavos) {
  return Number((centavos / 100).toFixed(2));
}

export function calcularResumoFinanceiro(orcamentos) {
  if (!Array.isArray(orcamentos)) {
    throw new ErroValidacaoResumoFinanceiro('O campo orcamentos deve ser uma lista.');
  }

  const somaEmCentavos = orcamentos.reduce((acumulado, orcamento, indice) => {
    const valorLimite = orcamento?.valorLimite;

    if (typeof valorLimite !== 'number' || !Number.isFinite(valorLimite) || valorLimite < 0) {
      throw new ErroValidacaoResumoFinanceiro(`orcamentos[${indice}].valorLimite deve ser um número finito não negativo.`);
    }

    return acumulado + paraCentavos(valorLimite);
  }, 0);

  const totalOrcamentos = orcamentos.length;

  return {
    totalOrcamentos,
    somaLimites: paraMoeda(somaEmCentavos),
    mediaLimites: totalOrcamentos === 0 ? 0 : paraMoeda(Math.round(somaEmCentavos / totalOrcamentos)),
    origem: 'azure-function',
    tipoAnalise: 'RESUMO_FINANCEIRO'
  };
}
