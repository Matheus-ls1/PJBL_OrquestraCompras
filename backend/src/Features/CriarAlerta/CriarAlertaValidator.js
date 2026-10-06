import { DomainValidationError } from '../../Domain/Errors/DomainValidationError.js'

export class CriarAlertaValidator {
  validate(command) {
    if (!(command.orcamentoAlvo > 0)) {
      throw new DomainValidationError('orcamentoAlvo deve ser maior que zero.')
    }
    if (!Array.isArray(command.produtos) || command.produtos.length === 0) {
      throw new DomainValidationError('produtos deve conter ao menos um item.')
    }
  }
}
