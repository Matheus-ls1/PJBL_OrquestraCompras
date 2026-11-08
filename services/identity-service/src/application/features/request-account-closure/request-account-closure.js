import { AccountStatus } from '../../../domain/account-status.js';
import { AppError } from '../../errors.js';

export function requestAccountClosure({ userRepository, clock, idGenerator }) {
  return async (userId, correlationId) => {
    const now = clock();
    const operationId = idGenerator();
    const event = { eventId: idGenerator(), tipo: 'EventoContaEncerramentoSolicitadoV1', versao: 1, operacaoId: operationId, usuarioId: String(userId), correlationId: correlationId || null, ocorridoEm: now, destinos: ['budget', 'monitoring'], publicadoEm: null };
    const updated = await userRepository.requestAccountClosure(userId, AccountStatus.ACTIVE, AccountStatus.CLOSURE_PENDING, now, event);
    if (!updated) throw new AppError('ENCERRAMENTO_NAO_DISPONIVEL', 'A conta não está disponível para encerramento.', 409);
    return { operacaoId: operationId, statusConta: AccountStatus.CLOSURE_PENDING };
  };
}
