import { useEffect, useState } from 'react'
import { pesquisarAlertas } from '../services/api'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

function OportunidadesPage() {
  const [alertas, setAlertas] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  async function carregarAlertas() {
    setStatus('loading'); setError('')
    try { setAlertas(await pesquisarAlertas()); setStatus('success') }
    catch (requestError) { setError(requestError.message || 'Não foi possível carregar as combinações.'); setStatus('error') }
  }

  useEffect(() => { void Promise.resolve().then(carregarAlertas) }, [])

  return (
    <section className="settings-page" id="inicio">
      <p className="eyebrow">COMBINAÇÕES POR LOJA</p><h1>Detalhamento dos alertas</h1><p className="hero-copy">Confira os produtos e as lojas de confiança vinculados a cada orçamento.</p>
      <button className="text-button" onClick={carregarAlertas} type="button">Atualizar lista</button>
      {status === 'loading' && <p className="state-message">Carregando combinações…</p>}
      {status === 'error' && <div className="state-message error"><p>{error}</p><button className="outline-button" onClick={carregarAlertas} type="button">Tentar novamente</button></div>}
      {status === 'success' && alertas.length === 0 && <p className="state-message">Nenhuma combinação cadastrada.</p>}
      {status === 'success' && alertas.map((alerta) => <article className="settings-card" key={alerta._id || alerta.id}><div><h2>{alerta.projeto || alerta.nomeAlerta || 'Alerta sem nome'}</h2><p>Orçamento máximo: <strong>{formatarMoeda(alerta.orcamentoAlvo)}</strong></p><div className="product-list">{(alerta.produtos || []).map((produto, index) => <div className="product-row" key={`${alerta._id || alerta.id}-${index}`}><strong>{typeof produto === 'string' ? produto : produto.item || produto.nome || produto.produto}</strong><span>{typeof produto === 'object' && produto.preco ? formatarMoeda(produto.preco) : ''}</span><span>Loja: {typeof produto === 'object' ? produto.loja || produto.nomeLoja : alerta.lojas?.[index] || 'Não informada'}</span></div>)}</div></div><span className="settings-status">{alerta.status || 'MONITORADO'}</span></article>)}
    </section>
  )
}

export default OportunidadesPage
