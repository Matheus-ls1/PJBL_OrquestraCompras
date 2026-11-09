export class ErroOfertaInvalida extends Error { constructor(message) { super(message); this.name = 'ErroOfertaInvalida'; } }
const text = value => String(value || '').toLowerCase();

export function normalizarOferta(oferta, { orcamentoId, item, lojas }) {
  if (!oferta?.ofertaId || !oferta?.produto || !oferta?.categoria || !oferta?.loja || !oferta?.urlOrigem || !oferta?.fonte) throw new ErroOfertaInvalida('Oferta incompleta.');
  if (!(Number(oferta.preco) > 0)) throw new ErroOfertaInvalida('Preço da oferta deve ser positivo.');
  if (oferta.moeda !== 'BRL') throw new ErroOfertaInvalida('Moeda da oferta deve ser BRL.');
  const loja = lojas.find(value => value.nome === oferta.loja && value.ativa);
  if (!loja) throw new ErroOfertaInvalida('Loja da oferta não é autorizada ou ativa.');
  const alternatives = item.opcoesAceitas || [];
  if (!alternatives.some(option => text(oferta.produto).includes(text(option)))) throw new ErroOfertaInvalida('Produto fora das alternativas aceitas.');
  return { ...oferta, orcamentoId, itemId: item.id, preco: Number(oferta.preco), encontrada: true, valida: true, disponivel: oferta.disponivel === true, elegivelParaCompraImediata: oferta.disponivel === true, coletadaEm: oferta.coletadaEm || new Date().toISOString() };
}
