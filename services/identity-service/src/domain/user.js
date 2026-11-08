import { AccountStatus } from './account-status.js';

export function createUser({ id, nome, email, senhaHash, now }) {
  return { id, nome, email, senhaHash, statusConta: AccountStatus.ACTIVE, criadoEm: now, atualizadoEm: now, ultimoLogin: null, revogacaoEm: null, confirmacoesPrivacidade: [], outboxPendente: [] };
}

export function toPublicUser(user) {
  return { id: String(user.id), nome: user.nome, email: user.email, statusConta: user.statusConta, criadoEm: user.criadoEm, atualizadoEm: user.atualizadoEm, ultimoLogin: user.ultimoLogin };
}
