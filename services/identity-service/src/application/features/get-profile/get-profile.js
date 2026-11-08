import { toPublicUser } from '../../../domain/user.js';
import { AppError } from '../../errors.js';

export function getProfile({ userRepository }) {
  return async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.', 404);
    return toPublicUser(user);
  };
}
