import { randomUUID } from 'node:crypto';
import { ErroOfertaInvalida, normalizarOferta } from '../../domain/oferta.js';

const sanitize = error => ({ code: error?.code || error?.name || 'CATALOGO_FALHOU', message: String(error?.message || 'Falha de catálogo.').slice(0, 200) });
const withTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Object.assign(new Error('Timeout de catálogo.'), { code: 'CATALOGO_TIMEOUT' })), timeoutMs); Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); }); });

export function createColetarOfertasUseCase({ repository, catalogAdapter, now = () => new Date(), id = randomUUID, timeoutMs = 5000, concurrency = 2 }) {
  async function collect(signature) {
    const startedAt = now(); const tentativa = { tentativaId: id(), orcamentoId: signature.orcamentoId, usuarioId: signature.usuarioId, versaoEvento: signature.versaoEvento, iniciadoEm: startedAt, status: 'INICIADA', itensAnalisados: signature.itensSnapshot.length, ofertasEncontradas: 0, ofertasValidas: 0, erros: [] };
    await repository.criarTentativa(tentativa);
    const offers = []; const errors = [];
    const items = [...signature.itensSnapshot]; let cursor = 0;
    const worker = async () => { while (cursor < items.length) { const item = items[cursor++]; try { const found = await withTimeout(catalogAdapter.consultar({ orcamentoId: signature.orcamentoId, item, lojas: signature.lojasSnapshot }), timeoutMs); for (const offer of found) { try { offers.push(normalizarOferta(offer, { orcamentoId: signature.orcamentoId, item, lojas: signature.lojasSnapshot })); } catch (error) { if (!(error instanceof ErroOfertaInvalida)) throw error; errors.push({ itemId: item.id, ...sanitize(error) }); } } } catch (error) { errors.push({ itemId: item.id, ...sanitize(error) }); } } };
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
    const status = errors.length === 0 ? 'CONCLUIDA' : offers.length > 0 ? 'PARCIAL' : 'FALHA';
    await repository.persistirOfertas(tentativa.tentativaId, offers);
    const finished = { ...tentativa, finalizadoEm: now(), status, ofertasEncontradas: offers.length, ofertasValidas: offers.filter(offer => offer.valida).length, erros: errors };
    await repository.finalizarTentativa(finished);
    return finished;
  }
  return { async executeBatch({ limit = 20, after } = {}) { const signatures = await repository.listarAssinaturasAtivas({ limit, after }); const attempts = []; for (const signature of signatures) attempts.push(await collect(signature)); return { processed: attempts.length, attempts }; }, collect };
}
