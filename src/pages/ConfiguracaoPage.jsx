import { useEffect, useState } from 'react'
import CardAlerta from '../components/CardAlerta'
import FormOrcamento from '../components/FormOrcamento'
import { pesquisarAlertas } from '../services/api'

function ConfiguracaoPage() {
  const [alertas, setAlertas] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  async function carregarAlertas() {
    setStatus('loading'); setError('')
    try { setAlertas(await pesquisarAlertas()); setStatus('success') }
    catch (requestError) { setError(requestError.message || 'Não foi possível carregar os alertas.'); setStatus('error') }
  }

  useEffect(() => { void Promise.resolve().then(carregarAlertas) }, [])

  return (
    <>
      <section className="hero-section" id="inicio"><p className="eyebrow">PAINEL DE ORÇAMENTOS</p><h1>Alertas monitorados</h1><p className="hero-copy">Crie, atualize ou remova seus alertas de orçamento.</p></section>
      <section className="content-grid" aria-label="Cadastro e lista de alertas">
        <aside className="panel budget-panel"><h2>Novo alerta</h2><p>Cadastre projeto, orçamento, produtos e lojas de confiança.</p><FormOrcamento onCreated={carregarAlertas} /></aside>
        <section className="opportunities-panel" aria-live="polite"><div className="section-heading"><div><p className="eyebrow">MONGODB ATLAS</p><h2>Alertas salvos</h2></div><button className="text-button" onClick={carregarAlertas} type="button">Atualizar</button></div>{status === 'loading' && <p className="state-message">Carregando alertas…</p>}{status === 'error' && <div className="state-message error"><p>{error}</p><button className="outline-button" onClick={carregarAlertas} type="button">Tentar novamente</button></div>}{status === 'success' && alertas.length === 0 && <p className="state-message">Nenhum alerta cadastrado.</p>}{status === 'success' && alertas.length > 0 && <div className="alert-grid">{alertas.map((alerta) => <CardAlerta alerta={alerta} key={alerta._id || alerta.id} onChanged={carregarAlertas} />)}</div>}</section>
      </section>
    </>
  )
}

export default ConfiguracaoPage
