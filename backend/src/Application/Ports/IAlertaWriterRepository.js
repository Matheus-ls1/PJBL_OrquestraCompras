// Contrato focado: casos de escrita não dependem de operações de consulta.
export class IAlertaWriterRepository {
  async adicionar(_alerta) {
    throw new Error('IAlertaWriterRepository.adicionar deve ser implementado.')
  }
}
