export function createCorsMiddleware(allowedOrigins = process.env.CORS_ALLOWED_ORIGINS || '') {
  const origins = new Set(allowedOrigins.split(',').map(value => value.trim()).filter(Boolean));
  return function cors(request, response, next) {
    const origin = request.get('origin');
    if (!origin) return next();
    if (!origins.has(origin)) return response.status(403).json({ code: 'ORIGEM_NAO_PERMITIDA', message: 'Origem não permitida.' });
    response.set({
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type,If-Match'
    });
    return request.method === 'OPTIONS' ? response.status(204).send() : next();
  };
}
