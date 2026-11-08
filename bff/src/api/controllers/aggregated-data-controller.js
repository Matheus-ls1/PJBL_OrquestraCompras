export function createAggregatedDataController({ aggregateData }) {
  return async function getAggregatedData(request, response, next) {
    const authorization = request.get('authorization');
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
      return response.status(401).json({ code: 'TOKEN_AUSENTE', message: 'Informe Authorization: Bearer <token>.' });
    }

    try {
      return response.status(200).json(await aggregateData(authorization));
    } catch (error) {
      return next(error);
    }
  };
}
