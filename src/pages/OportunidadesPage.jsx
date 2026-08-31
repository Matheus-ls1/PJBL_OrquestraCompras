import { useEffect, useState } from 'react'
import CardAlerta from '../components/CardAlerta'
import FormOrcamento from '../components/FormOrcamento'
import { getAlertasOrcamento } from '../services/api'

function OportunidadesPage() {
  const [status, setStatus] = useState('loading')
  const [alertas, setAlertas] = useState([])
  const [error, setError] = useState('')
  async function loadAlertas() {
    try { const data = await getAlertasOrcamento(); setAlertas(data); setStatus('success') }
    catch (requestError) { setError(requestError.message); setStatus('error') }
  }
  function handleRefresh() { setStatus('loading'); setError(''); loadAlertas() }
  useEffect(() => { void Promise.resolve().then(loadAlertas) }, [])
  return <><section className="hero-section" id="inicio"><p className="eyebrow">COMPRAS MAIS INTELIGENTES</p><h1>Encontre o momento certo para comprar.</h1><p className="hero-copy">Defina seu orçamento e acompanhe oportunidades em lojas que você confia.</p></section><section className="content-grid" aria-label="Orçamentos e oportunidades"><aside className="panel budget-panel"><h2>Novo orçamento</h2><p>Conte o que procura. A interface valida os campos antes do envio.</p><FormOrcamento /></aside><section className="opportunities-panel" aria-live="polite"><div className="section-heading"><div><p className="eyebrow">SEUS ALERTAS</p><h2>Oportunidades recentes</h2></div><button className="text-button" onClick={handleRefresh} type="button">Atualizar</button></div>{status === 'loading' && <p className="state-message">Buscando oportunidades…</p>}{status === 'error' && <div className="state-message error"><p>{error}</p><button className="outline-button" type="button" onClick={handleRefresh}>Tentar novamente</button></div>}{status === 'success' && alertas.length === 0 && <p className="state-message">Nenhuma oportunidade disponível no momento.</p>}{status === 'success' && alertas.length > 0 && <div className="alert-grid">{alertas.map((alerta, index) => <CardAlerta alerta={alerta} key={alerta.id || alerta.codigo || index} />)}</div>}</section></section></>
}

export default OportunidadesPage
