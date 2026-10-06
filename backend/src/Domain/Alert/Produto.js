import { DomainValidationError } from '../Errors/DomainValidationError.js'

export class Produto {
  constructor({ item, preco = null, loja = null }) {
    if (typeof item !== 'string' || !item.trim()) {
      throw new DomainValidationError('Todo produto deve possuir um item.')
    }
    if (preco !== null && (!Number.isFinite(preco) || preco < 0)) {
      throw new DomainValidationError('O preço do produto deve ser um número não negativo.')
    }

    this.item = item.trim()
    this.preco = preco
    this.loja = typeof loja === 'string' && loja.trim() ? loja.trim() : null
  }
}
