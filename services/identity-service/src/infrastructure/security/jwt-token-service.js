import jwt from 'jsonwebtoken';
import { AppError } from '../../application/errors.js';

export function createJwtTokenService({ secret, expiresIn }) {
  const ensureSecret = () => {
    if (!secret) throw new AppError('CONFIGURACAO_INCOMPLETA', 'A autenticação não está configurada neste ambiente.', 503);
  };
  return {
    sign(user) { ensureSecret(); return jwt.sign({ sub: String(user.id), email: user.email, revogacaoEm: user.revogacaoEm ? new Date(user.revogacaoEm).toISOString() : null }, secret, { expiresIn }); },
    verify(token) {
      ensureSecret();
      try { return jwt.verify(token, secret); }
      catch { throw new AppError('TOKEN_INVALIDO', 'Token ausente, inválido ou expirado.', 401); }
    }
  };
}
