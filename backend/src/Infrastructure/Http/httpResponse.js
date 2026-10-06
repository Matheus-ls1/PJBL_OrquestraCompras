import { DomainValidationError } from '../../Domain/Errors/DomainValidationError.js'

export function json(status, body) {
  return { status, jsonBody: body, headers: { 'content-type': 'application/json; charset=utf-8' } }
}

export function mapError(error, context) {
  context.error(error)
  if (error instanceof DomainValidationError) return json(400, { message: error.message })
  if (error?.message === 'Alerta não encontrado.') return json(404, { message: error.message })
  return json(500, { message: 'Ocorreu um erro interno ao processar a solicitação.' })
}
