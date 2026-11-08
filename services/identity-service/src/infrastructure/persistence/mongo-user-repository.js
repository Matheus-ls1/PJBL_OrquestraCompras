import { MongoClient, ObjectId } from 'mongodb';

function toDocument(user) { const { id, ...document } = user; return { _id: new ObjectId(id), ...document }; }
function toUser(document) { if (!document) return null; const { _id, ...user } = document; return { id: _id.toString(), ...user }; }

export function createMongoUserRepository({ uri, databaseName, maxPoolSize = 10 }) {
  let client;
  let indexesPromise;
  async function collection() {
    if (!uri) { const error = new Error('MONGODB_URI não configurada.'); error.code = 'MONGODB_NOT_CONFIGURED'; throw error; }
    if (!client) client = new MongoClient(uri, { maxPoolSize });
    await client.connect();
    const users = client.db(databaseName).collection('usuarios');
    if (!indexesPromise) indexesPromise = users.createIndex({ email: 1 }, { unique: true, name: 'usuarios_email_unico' });
    await indexesPromise;
    return users;
  }
  function objectId(id) { return ObjectId.isValid(id) ? new ObjectId(id) : null; }
  return {
    async ping() { if (!uri) { const error = new Error('MONGODB_URI não configurada.'); error.code = 'MONGODB_NOT_CONFIGURED'; throw error; } if (!client) client = new MongoClient(uri, { maxPoolSize }); await client.connect(); await client.db(databaseName).command({ ping: 1 }); },
    async findByEmail(email) { return toUser(await (await collection()).findOne({ email })); },
    async findById(id) { const _id = objectId(id); return _id ? toUser(await (await collection()).findOne({ _id })) : null; },
    async create(user) { try { await (await collection()).insertOne(toDocument(user)); } catch (error) { if (error.code === 11000) { error.code = 'DUPLICATE_EMAIL'; } throw error; } },
    async updateLastLogin(id, ultimoLogin) { const _id = objectId(id); if (_id) await (await collection()).updateOne({ _id }, { $set: { ultimoLogin, atualizadoEm: ultimoLogin } }); },
    async updateProfile(id, update) { const _id = objectId(id); if (!_id) return null; try { return toUser(await (await collection()).findOneAndUpdate({ _id }, { $set: update }, { returnDocument: 'after' })); } catch (error) { if (error.code === 11000) error.code = 'DUPLICATE_EMAIL'; throw error; } },
    async changePassword(id, senhaHash, now) { const _id = objectId(id); if (_id) await (await collection()).updateOne({ _id }, { $set: { senhaHash, revogacaoEm: now, atualizadoEm: now } }); },
    async requestAccountClosure(id, expectedStatus, nextStatus, now, event) { const _id = objectId(id); if (!_id) return null; return toUser(await (await collection()).findOneAndUpdate({ _id, statusConta: expectedStatus }, { $set: { statusConta: nextStatus, revogacaoEm: now, atualizadoEm: now }, $push: { outboxPendente: event } }, { returnDocument: 'after' })); }
  };
}
