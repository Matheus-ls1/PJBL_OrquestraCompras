import { env } from '../config/env'

async function lerResposta(response) {
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : null
}

async function requisitar(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...options.headers },
      ...options,
    })
    const body = await lerResposta(response)
    if (!response.ok) throw new Error(body?.message || `A operação falhou (HTTP ${response.status}).`)
    return body
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Não foi possível comunicar com o serviço de alertas.')
  }
}

function urlComId(url, id) {
  const endpoint = new URL(url, window.location.origin)
  endpoint.searchParams.set('id', id)
  return url.startsWith('http') ? endpoint.toString() : `${endpoint.pathname}${endpoint.search}`
}

export async function pesquisarAlertas() {
  const resposta = await requisitar(env.getUrl)
  if (Array.isArray(resposta)) return resposta
  return resposta?.alertas || resposta?.data || []
}

export function criarAlerta(dados) {
  return requisitar(env.postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function atualizarAlerta(id, dados) {
  return requisitar(urlComId(env.putUrl, id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function excluirAlerta(id) {
  return requisitar(urlComId(env.deleteUrl, id), { method: 'DELETE' })
}
