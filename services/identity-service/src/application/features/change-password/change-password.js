import { AppError } from '../../errors.js';
import { validatePassword } from '../../validation.js';

export function changePassword({ userRepository, passwordHasher, clock }) {
  return async (userId, { senhaAtual, novaSenha }) => {
    const user = await userRepository.findById(userId);
    if (!user || !await passwordHasher.compare(validatePassword(senhaAtual, 'senha atual'), user.senhaHash)) {
      throw new AppError('CREDENCIAIS_INVALIDAS', 'Não foi possível alterar a senha.', 401);
    }
    const now = clock();
    await userRepository.changePassword(userId, await passwordHasher.hash(validatePassword(novaSenha, 'nova senha')), now);
  };
}
