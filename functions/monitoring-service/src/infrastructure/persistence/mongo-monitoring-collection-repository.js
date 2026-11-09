import { MongoClient } from 'mongodb';

let sharedClient;
let sharedConnection;
export function createMongoMonitoringCollectionRepository({ uri, database = 'db_monitoring', client }) {
  async function mongo() { if (!uri && !client) { const error = new Error('MONGODB_MONITORING_URI não configurada.'); error.code = 'MONGODB_NOT_CONFIGURED'; throw error; } if (!client) { sharedClient ||= new MongoClient(uri); sharedConnection ||= sharedClient.connect(); await sharedConnection; } return client || sharedClient; }
  async function collections() { const db = (await mongo()).db(database); const signatures = db.collection('assinaturasMonitoramento'); const attempts = db.collection('tentativasMonitoramento'); const offers = db.collection('ofertas'); const opportunities = db.collection('oportunidades'); await Promise.all([attempts.createIndex({ tentativaId: 1 }, { unique: true, name: 'ux_tentativas_monitoramento_id' }), attempts.createIndex({ orcamentoId: 1, versaoEvento: 1, iniciadoEm: -1 }, { name: 'ix_tentativas_orcamento_versao' }), offers.createIndex({ tentativaId: 1, ofertaId: 1 }, { unique: true, name: 'ux_ofertas_tentativa_oferta' }), offers.createIndex({ orcamentoId: 1, itemId: 1, coletadaEm: -1 }, { name: 'ix_ofertas_orcamento_item_data' }), opportunities.createIndex({ tentativaId: 1 }, { unique: true, name: 'ux_oportunidades_tentativa' }), opportunities.createIndex({ usuarioId: 1, orcamentoId: 1, criadaEm: -1 }, { name: 'ix_oportunidades_usuario_orcamento' })]); return { signatures, attempts, offers, opportunities }; }
  return {
    async listarAssinaturasAtivas({ limit, after }) { const { signatures } = await collections(); const filter = { ativoParaMonitoramento: true, status: 'MONITORANDO', excluidoEm: null, ...(after ? { orcamentoId: { $gt: after } } : {}) }; return signatures.find(filter).sort({ orcamentoId: 1 }).limit(limit).toArray(); },
    async criarTentativa(attempt) { const { attempts } = await collections(); await attempts.insertOne(attempt); },
    async persistirOfertas(tentativaId, values) { if (!values.length) return; const { offers } = await collections(); await offers.insertMany(values.map(value => ({ ...value, tentativaId })), { ordered: false }); },
    async finalizarTentativa(attempt) { const { attempts } = await collections(); const result = await attempts.updateOne({ tentativaId: attempt.tentativaId }, { $set: attempt }); if (!result.matchedCount) throw new Error('Tentativa de monitoramento não encontrada.'); },
    async obterAssinatura(orcamentoId, usuarioId) { const { signatures } = await collections(); return signatures.findOne({ orcamentoId: String(orcamentoId).toLowerCase(), usuarioId }); },
    async listarOfertasPorTentativa(tentativaId) { const { offers } = await collections(); return offers.find({ tentativaId }).toArray(); },
    async salvarOportunidade(value) { const { opportunities } = await collections(); await opportunities.updateOne({ tentativaId: value.tentativaId }, { $setOnInsert: value }, { upsert: true }); return opportunities.findOne({ tentativaId: value.tentativaId }); },
    async listarOportunidades({ usuarioId, orcamentoId }) { const { opportunities } = await collections(); return opportunities.find({ usuarioId, ...(orcamentoId ? { orcamentoId: String(orcamentoId).toLowerCase() } : {}) }).sort({ criadaEm: -1 }).limit(50).toArray(); }
  };
}
