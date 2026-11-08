import { createUser, toPublicUser } from '../../../domain/user.js';
import { AppError } from '../../errors.js';
import { normalizeEmail, validateName, validatePassword } from '../../validation.js';

export function registerUser({ userRepository, passwordHasher, clock, idGenerator }) {
  return async ({ nome, email, senha }) => {
    const normalizedEmail = normalizeEmail(email);
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) throw new AppError('EMAIL_JA_CADASTRADO', 'Não foi possível concluir o cadastro.', 409);
    const user = createUser({ id: idGenerator(), nome: validateName(nome), email: normalizedEmail, senhaHash: await passwordHasher.hash(validatePassword(senha)), now: clock() });
    try {
      await userRepository.create(user);
    } catch (error) {
      if (error.code === 'DUPLICATE_EMAIL') throw new AppError('EMAIL_JA_CADASTRADO', 'Não foi possível concluir o cadastro.', 409);
      throw error;
    }
    return toPublicUser(user);
  };
}
