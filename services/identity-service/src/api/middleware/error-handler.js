import { AppError } from '../../application/errors.js';

export function notFoundHandler(_request, response) { response.status(404).json({ code: 'ROTA_NAO_ENCONTRADA', message: 'Rota não encontrada.' }); }
export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) return response.status(error.status).json({ code: error.code, message: error.message });
  return response.status(500).json({ code: 'ERRO_INTERNO', message: 'Não foi possível concluir a operação.' });
}
