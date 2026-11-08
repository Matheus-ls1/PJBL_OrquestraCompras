import { AggregateDataError } from '../../application/features/aggregate-data/aggregate-data.js';

function joinUrl(baseUrl, path) {
  return new URL(path, `${baseUrl.replace(/\/$/, '')}/`).toString();
}

async function requestJson({ fetchImpl, name, url, options, timeoutMs, allowsAuthenticationFailure = false }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    if (allowsAuthenticationFailure && (response.status === 401 || response.status === 403)) {
      throw new AggregateDataError('Token ausente, inválido ou expirado.', { code: 'TOKEN_INVALIDO', status: 401 });
    }
    if (!response.ok) {
      throw new AggregateDataError(`${name} indisponível.`, { code: 'DEPENDENCIA_INDISPONIVEL', status: 502 });
    }
    try {
      return await response.json();
    } catch {
      throw new AggregateDataError(`${name} retornou uma resposta inválida.`, { code: 'CONTRATO_DEPENDENCIA_INVALIDO', status: 502 });
    }
  } catch (error) {
    if (error instanceof AggregateDataError) throw error;
    if (error?.name === 'AbortError') {
      throw new AggregateDataError(`${name} excedeu o tempo limite.`, { code: 'DEPENDENCIA_TIMEOUT', status: 504 });
    }
    throw new AggregateDataError(`${name} indisponível.`, { code: 'DEPENDENCIA_INDISPONIVEL', status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export function createServiceClients(config = {}) {
  const fetchImpl = config.fetchImpl || globalThis.fetch;
  const timeoutMs = Number(config.timeoutMs || process.env.HTTP_TIMEOUT_MS || 5000);
  const identityUrl = config.identityServiceUrl || process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
  const budgetUrl = config.budgetServiceUrl || process.env.BUDGET_SERVICE_URL || 'http://localhost:3002';
  const monitoringUrl = config.monitoringServiceUrl || process.env.MONITORING_SERVICE_URL || 'http://localhost:7071';
  const functionKey = config.functionKey ?? process.env.AZURE_FUNCTION_KEY;
  const authenticatedHeaders = authorization => ({ authorization });

  return {
    identity: {
      getProfile: authorization => requestJson({ fetchImpl, name: 'Identity Service', url: joinUrl(identityUrl, '/api/v1/auth/profile'), options: { headers: authenticatedHeaders(authorization) }, timeoutMs, allowsAuthenticationFailure: true })
    },
    budget: {
      listBudgets: authorization => requestJson({ fetchImpl, name: 'Budget Service', url: joinUrl(budgetUrl, '/api/v1/orcamentos'), options: { headers: authenticatedHeaders(authorization) }, timeoutMs, allowsAuthenticationFailure: true })
    },
    monitoring: {
      calculateFinancialSummary: input => requestJson({ fetchImpl, name: 'Monitoring Service', url: joinUrl(monitoringUrl, '/api/v1/monitoramento/resumo-financeiro'), options: { method: 'POST', headers: { 'content-type': 'application/json', ...(functionKey ? { 'x-functions-key': functionKey } : {}) }, body: JSON.stringify(input) }, timeoutMs })
    }
  };
}
