import { MongoClient } from 'mongodb'

export class MongoConnection {
  constructor({ connectionString, databaseName }) {
    this.connectionString = connectionString
    this.databaseName = databaseName
    this.client = null
  }

  async database() {
    if (!this.client) {
      this.client = new MongoClient(this.connectionString)
      await this.client.connect()
    }
    return this.client.db(this.databaseName)
  }
}
