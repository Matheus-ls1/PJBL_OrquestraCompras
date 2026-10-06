export function paraAlertaResponse(alerta) {
  return {
    id: alerta.id,
    nomeAlerta: alerta.nomeAlerta,
    // Compatibilidade temporária com o cliente React existente.
    projeto: alerta.nomeAlerta,
    orcamentoAlvo: alerta.orcamentoAlvo,
    status: alerta.status,
    produtos: alerta.produtos,
    lojasConfianca: alerta.lojasConfianca,
    lojas: alerta.lojasConfianca,
  }
}
