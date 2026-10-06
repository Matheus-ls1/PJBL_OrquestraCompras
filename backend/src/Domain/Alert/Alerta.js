import { DomainValidationError } from '../Errors/DomainValidationError.js'
import { Produto } from './Produto.js'

const STATUS_MONITORADO = 'MONITORADO'

export class Alerta {
  constructor({ id = null, nomeAlerta, orcamentoAlvo, status = STATUS_MONITORADO, produtos, lojasConfianca = [] }) {
    if (typeof nomeAlerta !== 'string' || !nomeAlerta.trim()) {
      throw new DomainValidationError('O nome do alerta é obrigatório.')
    }
    if (!Number.isFinite(orcamentoAlvo) || orcamentoAlvo <= 0) {
      throw new DomainValidationError('O orçamento alvo deve ser maior que zero.')
    }
    if (!Array.isArray(produtos) || produtos.length === 0) {
      throw new DomainValidationError('Informe pelo menos um produto para monitorar.')
    }
    if (!Array.isArray(lojasConfianca)) {
      throw new DomainValidationError('As lojas de confiança devem ser uma lista.')
    }

    this.id = id
    this.nomeAlerta = nomeAlerta.trim()
    this.orcamentoAlvo = orcamentoAlvo
    this.status = status
    this.produtos = produtos.map((produto) => produto instanceof Produto ? produto : new Produto(produto))
    this.lojasConfianca = [...new Set(lojasConfianca
      .filter((loja) => typeof loja === 'string' && loja.trim())
      .map((loja) => loja.trim()))]
  }

  static criar(dados) {
    return new Alerta(dados)
  }
}
