import { calcularResumoFinanceiro } from '../../domain/resumo-financeiro.js';

export function calcularResumoFinanceiroUseCase(entrada) {
  return calcularResumoFinanceiro(entrada?.orcamentos);
}
