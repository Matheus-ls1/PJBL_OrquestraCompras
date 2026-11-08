export function notFoundHandler(_request, response) {
  response.status(404).json({ code: 'NAO_ENCONTRADO', message: 'Rota não encontrada.' });
}

export function errorHandler(error, request, response, _next) {
  const status = error.status || 500;
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error(JSON.stringify({ service: 'bff', method: request.method, path: request.originalUrl, errorCode: error.code || 'ERRO_INTERNO', errorName: error.name }));
  }
  response.status(status).json({ code: error.code || 'ERRO_INTERNO', message: status === 500 ? 'Não foi possível concluir a operação.' : error.message });
}
