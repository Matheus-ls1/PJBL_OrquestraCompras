const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function avaliarCesta({ assinatura, ofertas }) {
  const obrigatorios = (assinatura.itensSnapshot || []).filter(item => item.obrigatorio);
  const produtos = []; const motivos = [];
  for (const item of obrigatorios) {
    const candidatas = ofertas.filter(oferta => oferta.itemId === item.id && oferta.valida && oferta.disponivel && oferta.elegivelParaCompraImediata).sort((a, b) => a.preco - b.preco || a.ofertaId.localeCompare(b.ofertaId));
    if (!candidatas.length) motivos.push(`Não há oferta válida e disponível para o item obrigatório ${item.categoria}.`);
    else produtos.push(candidatas[0]);
  }
  const valorTotal = money(produtos.reduce((sum, oferta) => sum + oferta.preco, 0)); const diferencaLimite = money(Number(assinatura.valorLimite) - valorTotal);
  if (motivos.length) return { decisao: 'AGUARDAR', produtos, valorTotal, diferencaLimite, justificativa: motivos.join(' ') };
  if (!(Number(assinatura.valorLimite) > 0) || valorTotal > Number(assinatura.valorLimite)) return { decisao: 'AGUARDAR', produtos, valorTotal, diferencaLimite, justificativa: 'A cesta válida excede o limite financeiro do orçamento.' };
  return { decisao: 'COMPRAR_AGORA', produtos, valorTotal, diferencaLimite, justificativa: 'Todos os itens obrigatórios possuem oferta válida, disponível e dentro do limite financeiro.' };
}
