import { ObjectId } from 'mongodb'
import { Alerta } from '../../Domain/Alert/Alerta.js'
import { DomainValidationError } from '../../Domain/Errors/DomainValidationError.js'

export class MongoAlertaRepository {
  constructor({ connection, collectionName }) {
    this.connection = connection
    this.collectionName = collectionName
  }

  async adicionar(alerta) {
    const collection = await this.#collection()
    const document = {
      nomeAlerta: alerta.nomeAlerta,
      orcamentoAlvo: alerta.orcamentoAlvo,
      status: alerta.status,
      produtos: alerta.produtos,
      lojasConfianca: alerta.lojasConfianca,
      criadoEm: new Date(),
    }
    const result = await collection.insertOne(document)
    return new Alerta({ ...alerta, id: result.insertedId.toHexString() })
  }

  async listar() {
    const documents = await (await this.#collection()).find({}).sort({ criadoEm: -1 }).toArray()
    return documents.map((document) => this.#toAlerta(document))
  }

  async atualizarOrcamento(id, orcamentoAlvo) {
    const objectId = this.#objectId(id)
    const collection = await this.#collection()
    const result = await collection.updateOne({ _id: objectId }, { $set: { orcamentoAlvo } })
    if (!result.matchedCount) return null
    return this.#toAlerta(await collection.findOne({ _id: objectId }))
  }

  async excluir(id) {
    const result = await (await this.#collection()).deleteOne({ _id: this.#objectId(id) })
    return result.deletedCount === 1
  }

  async #collection() {
    return (await this.connection.database()).collection(this.collectionName)
  }

  #objectId(id) {
    if (!isMongoId(id)) throw new DomainValidationError('ID de alerta inválido.')
    return new ObjectId(id)
  }

  #toAlerta(document) {
    return new Alerta({
      id: document._id.toHexString(),
      nomeAlerta: document.nomeAlerta ?? document.projeto,
      orcamentoAlvo: document.orcamentoAlvo,
      status: document.status,
      produtos: document.produtos,
      lojasConfianca: document.lojasConfianca ?? document.lojas ?? [],
    })
  }
}

// Garante que o adaptador continua compatível com IDs Mongo antes de futuros usos por ID.
export function isMongoId(value) {
  return ObjectId.isValid(value)
}
