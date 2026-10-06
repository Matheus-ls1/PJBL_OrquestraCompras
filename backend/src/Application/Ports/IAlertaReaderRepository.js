// Contrato focado: consultas não dependem de operações de escrita.
export class IAlertaReaderRepository {
  async listar() {
    throw new Error('IAlertaReaderRepository.listar deve ser implementado.')
  }
}
