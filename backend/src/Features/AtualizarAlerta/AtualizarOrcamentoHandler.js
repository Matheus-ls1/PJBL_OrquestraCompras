import { DomainValidationError } from '../../Domain/Errors/DomainValidationError.js'

export class AtualizarOrcamentoHandler {
  constructor({ alertaUpdaterRepository }) {
    this.alertaUpdaterRepository = alertaUpdaterRepository
  }

  async execute({ id, orcamentoAlvo }) {
    if (typeof id !== 'string' || !id.trim()) throw new DomainValidationError('id é obrigatório.')
    if (!Number.isFinite(orcamentoAlvo) || orcamentoAlvo <= 0) {
      throw new DomainValidationError('orcamentoAlvo deve ser maior que zero.')
    }
    const alerta = await this.alertaUpdaterRepository.atualizarOrcamento(id, orcamentoAlvo)
    if (!alerta) throw new Error('Alerta não encontrado.')
    return alerta
  }
}
