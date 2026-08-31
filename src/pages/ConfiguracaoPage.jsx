import FormOrcamento from '../components/FormOrcamento'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

function ConfiguracaoPage({ orcamentos, status, onShowDetails }) {
  return (
    <>
      <section className="hero-section" id="inicio">
        <p className="eyebrow">PAINEL DE ACOMPANHAMENTO</p>
        <h1>Orçamentos &amp; alertas disparados</h1>
        <p className="hero-copy">Acompanhe os alertas monitorados e consulte as combinações encontradas pelas lojas de confiança.</p>
      </section>
      <section className="content-grid" aria-label="Painel de orçamentos e alertas">
        <aside className="panel budget-panel">
          <h2>Simular novo alerta</h2>
          <p>Preencha os dados para validar visualmente uma nova solicitação de orçamento.</p>
          <FormOrcamento />
        </aside>
        <section className="opportunities-panel" aria-live="polite">
          <div className="section-heading"><div><p className="eyebrow">ALERTAS MONITORADOS</p><h2>Orçamentos encontrados</h2></div></div>
          {status === 'loading' && <p className="state-message">Carregando orçamentos…</p>}
          {status === 'success' && orcamentos.length === 0 && <p className="state-message">Nenhum orçamento monitorado no momento.</p>}
          {status === 'success' && orcamentos.length > 0 && <div className="alert-grid">{orcamentos.map((orcamento) => <article className="alert-card" key={orcamento.id}><div className="alert-card-top"><span className="store-badge">{orcamento.usuario || 'OrquestraCompras'}</span><span className="status-dot">{orcamento.status || 'MONITORADO'}</span></div><h3>{orcamento.nomeAlerta}</h3><dl className="summary-list"><div><dt>Orçamento máximo</dt><dd>{formatarMoeda(orcamento.orcamentoAlvo)}</dd></div><div><dt>Valor encontrado</dt><dd>{formatarMoeda(orcamento.valorTotalEncontrado)}</dd></div><div><dt>Economia</dt><dd>{formatarMoeda(orcamento.economia)}</dd></div></dl><button className="outline-button" onClick={onShowDetails} type="button">Ver detalhes das lojas</button></article>)}</div>}
        </section>
      </section>
    </>
  )
}

export default ConfiguracaoPage
