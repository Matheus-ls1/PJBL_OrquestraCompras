import { isActiveAccount } from '../../domain/account-status.js';
import { AppError } from '../../application/errors.js';

export function authenticate(dependencies) {
  return async (request, _response, next) => {
    try {
      const header = request.get('authorization');
      if (!header?.startsWith('Bearer ')) throw new AppError('TOKEN_INVALIDO', 'Token ausente, inválido ou expirado.', 401);
      const payload = dependencies.tokenService.verify(header.slice(7));
      const user = await dependencies.userRepository.findById(payload.sub);
      if (!user || !isActiveAccount(user.statusConta)) throw new AppError('CONTA_INATIVA', 'Esta conta não está disponível para acesso.', 403);
      if ((user.revogacaoEm ? new Date(user.revogacaoEm).toISOString() : null) !== (payload.revogacaoEm || null)) throw new AppError('TOKEN_REVOGADO', 'Token ausente, inválido ou expirado.', 401);
      request.auth = { userId: user.id };
      next();
    } catch (error) { next(error); }
  };
}
