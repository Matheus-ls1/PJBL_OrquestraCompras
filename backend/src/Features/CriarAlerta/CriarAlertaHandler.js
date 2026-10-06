import { Alerta } from '../../Domain/Alert/Alerta.js'

export class CriarAlertaHandler {
  constructor({ alertaWriterRepository, validator }) {
    this.alertaWriterRepository = alertaWriterRepository
    this.validator = validator
  }

  async execute(command) {
    this.validator.validate(command)
    const alerta = Alerta.criar(command)
    return this.alertaWriterRepository.adicionar(alerta)
  }
}
