export class CriarAlertaCommand {
  constructor({ nomeAlerta, orcamentoAlvo, produtos, lojasConfianca }) {
    this.nomeAlerta = nomeAlerta
    this.orcamentoAlvo = orcamentoAlvo
    this.produtos = produtos
    this.lojasConfianca = lojasConfianca
  }
}
