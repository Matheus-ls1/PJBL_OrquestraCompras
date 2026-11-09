export function createProxyController({ proxy, requiresAuth }) {
  return async function proxyRequest(request, response, next) {
    const authorization = request.get('authorization');
    if (requiresAuth && (!authorization || !/^Bearer\s+\S+$/i.test(authorization))) {
      return response.status(401).json({ code: 'TOKEN_AUSENTE', message: 'Informe Authorization: Bearer <token>.' });
    }

    try {
      const path = `${request.baseUrl}${request.path}`.replace(/\/$/, '') || '/';
      const downstream = await proxy({
        method: request.method,
        path,
        authorization: requiresAuth ? authorization : undefined,
        ifMatch: request.get('if-match') || undefined,
        body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined
      });
      return downstream.body === undefined ? response.status(downstream.status).send() : response.status(downstream.status).json(downstream.body);
    } catch (error) {
      return next(error);
    }
  };
}
