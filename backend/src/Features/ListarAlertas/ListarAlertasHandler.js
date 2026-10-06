import { paraAlertaResponse } from './AlertaResponse.js'

export class ListarAlertasHandler {
  constructor({ alertaReaderRepository }) {
    this.alertaReaderRepository = alertaReaderRepository
  }

  async execute(_query) {
    const alertas = await this.alertaReaderRepository.listar()
    return alertas.map(paraAlertaResponse)
  }
}
