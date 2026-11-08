import { app } from '@azure/functions';
import { ErroValidacaoResumoFinanceiro } from '../domain/resumo-financeiro.js';
import { calcularResumoFinanceiroUseCase } from '../application/resumo-financeiro/calcular-resumo-financeiro.js';

export async function resumoFinanceiroHttp(request) {
  let entrada;

  try {
    entrada = await request.json();
  } catch {
    return {
      status: 400,
      jsonBody: { code: 'CORPO_JSON_INVALIDO', message: 'Informe um corpo JSON válido.' }
    };
  }

  try {
    return { status: 200, jsonBody: calcularResumoFinanceiroUseCase(entrada) };
  } catch (error) {
    if (error instanceof ErroValidacaoResumoFinanceiro) {
      return { status: 400, jsonBody: { code: 'ENTRADA_INVALIDA', message: error.message } };
    }

    throw error;
  }
}

app.http('resumoFinanceiro', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'v1/monitoramento/resumo-financeiro',
  handler: resumoFinanceiroHttp
});
