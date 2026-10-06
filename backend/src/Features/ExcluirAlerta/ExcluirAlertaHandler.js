import { DomainValidationError } from '../../Domain/Errors/DomainValidationError.js'

export class ExcluirAlertaHandler {
  constructor({ alertaDeleterRepository }) {
    this.alertaDeleterRepository = alertaDeleterRepository
  }

  async execute({ id }) {
    if (typeof id !== 'string' || !id.trim()) throw new DomainValidationError('id é obrigatório.')
    if (!await this.alertaDeleterRepository.excluir(id)) throw new Error('Alerta não encontrado.')
  }
}
