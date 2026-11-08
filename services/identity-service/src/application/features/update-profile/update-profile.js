import { toPublicUser } from '../../../domain/user.js';
import { AppError } from '../../errors.js';
import { normalizeEmail, validateName } from '../../validation.js';

export function updateProfile({ userRepository, clock }) {
  return async (userId, input) => {
    const update = {};
    if (Object.hasOwn(input, 'nome')) update.nome = validateName(input.nome);
    if (Object.hasOwn(input, 'email')) update.email = normalizeEmail(input.email);
    if (!Object.keys(update).length) throw new AppError('PERFIL_INVALIDO', 'Informe nome ou e-mail para atualizar.');
    update.atualizadoEm = clock();
    try {
      const user = await userRepository.updateProfile(userId, update);
      if (!user) throw new AppError('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.', 404);
      return toPublicUser(user);
    } catch (error) {
      if (error.code === 'DUPLICATE_EMAIL') throw new AppError('EMAIL_JA_CADASTRADO', 'Não foi possível atualizar o e-mail.', 409);
      throw error;
    }
  };
}
