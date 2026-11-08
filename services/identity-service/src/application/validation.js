import { AppError } from './errors.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  if (typeof value !== 'string') throw new AppError('EMAIL_INVALIDO', 'Informe um e-mail válido.');
  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new AppError('EMAIL_INVALIDO', 'Informe um e-mail válido.');
  return email;
}

export function validateName(value) {
  if (typeof value !== 'string') throw new AppError('NOME_INVALIDO', 'Informe um nome entre 2 e 120 caracteres.');
  const nome = value.trim();
  if (nome.length < 2 || nome.length > 120) throw new AppError('NOME_INVALIDO', 'Informe um nome entre 2 e 120 caracteres.');
  return nome;
}

export function validatePassword(value, field = 'senha') {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new AppError('SENHA_INVALIDA', `A ${field} deve ter ao menos 8 caracteres e no máximo 72 bytes.`);
  }
  return value;
}
