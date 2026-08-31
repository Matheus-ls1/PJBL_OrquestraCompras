import { env, hasApiUrl } from '../config/env'

export class ApiConfigurationError extends Error {
  constructor() {
    super('A integração não está configurada. Defina VITE_API_URL no ambiente.')
    this.name = 'ApiConfigurationError'
  }
}

export async function getAlertasOrcamento() {
  if (!hasApiUrl) throw new ApiConfigurationError()
  try {
    const response = await fetch(env.apiUrl, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Não foi possível carregar as oportunidades agora.')
    const payload = await response.json()
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.alertas)) return payload.alertas
    if (Array.isArray(payload?.data)) return payload.data
    return []
  } catch (error) {
    if (error instanceof ApiConfigurationError) throw error
    throw new Error(error.message || 'Falha de conexão. Tente novamente mais tarde.')
  }
}
