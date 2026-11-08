import { isActiveAccount } from '../../../domain/account-status.js';
import { toPublicUser } from '../../../domain/user.js';
import { AppError } from '../../errors.js';
import { normalizeEmail, validatePassword } from '../../validation.js';

export function loginUser({ userRepository, passwordHasher, tokenService, clock }) {
  return async ({ email, senha }) => {
    const user = await userRepository.findByEmail(normalizeEmail(email));
    const valid = user && await passwordHasher.compare(validatePassword(senha), user.senhaHash);
    if (!valid) throw new AppError('CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos.', 401);
    if (!isActiveAccount(user.statusConta)) throw new AppError('CONTA_INATIVA', 'Esta conta não está disponível para acesso.', 403);
    const now = clock();
    await userRepository.updateLastLogin(user.id, now);
    user.ultimoLogin = now;
    return { token: tokenService.sign(user), usuario: toPublicUser(user) };
  };
}
