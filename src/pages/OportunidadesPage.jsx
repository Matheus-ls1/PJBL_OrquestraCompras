function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

function OportunidadesPage({ orcamentos, status }) {
  if (status === 'loading') return <p className="state-message">Carregando combinações por loja…</p>
  if (orcamentos.length === 0) return <p className="state-message">Nenhuma combinação disponível no momento.</p>

  return <section className="settings-page" id="inicio">
    <p className="eyebrow">DETALHAMENTO DAS LOJAS</p>
    <h1>Combinações por loja</h1>
    <p className="hero-copy">Itens e valores recebidos para cada orçamento monitorado.</p>
    {orcamentos.map((orcamento) => <article className="settings-card detail-card" key={orcamento.id}><div className="detail-heading"><div><h2>{orcamento.nomeAlerta}</h2><p>Status: <strong>{orcamento.status || 'MONITORADO'}</strong></p></div><span className="settings-status">Orçamento atingido</span></div><div className="product-list">{orcamento.produtos.map((produto) => <div className="product-row" key={produto.id || `${produto.item}-${produto.loja}`}><div><strong>{produto.item || produto.nomeProduto || produto.produto}</strong><p>Loja de confiança: {produto.loja || produto.nomeLoja}</p></div><strong>{formatarMoeda(produto.preco || produto.valor)}</strong></div>)}</div><div className="consolidated-summary"><span>Orçamento máximo: <strong>{formatarMoeda(orcamento.orcamentoAlvo)}</strong></span><span>Total encontrado: <strong>{formatarMoeda(orcamento.valorTotalEncontrado)}</strong></span><span>Economia: <strong>{formatarMoeda(orcamento.economia)}</strong></span></div></article>)}
  </section>
}

export default OportunidadesPage
