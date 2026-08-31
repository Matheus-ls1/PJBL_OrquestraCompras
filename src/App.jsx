import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import OportunidadesPage from './pages/OportunidadesPage'
import { getAlertasOrcamento } from './services/api'

function App() {
  const [activePage, setActivePage] = useState('painel')
  const [orcamentos, setOrcamentos] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    void getAlertasOrcamento().then((dados) => { setOrcamentos(dados); setStatus('success') })
  }, [])

  return <div className="app-shell"><Navbar activePage={activePage} onNavigate={setActivePage} /><main className="page-container">{activePage === 'painel' ? <ConfiguracaoPage orcamentos={orcamentos} status={status} onShowDetails={() => setActivePage('oportunidades')} /> : <OportunidadesPage orcamentos={orcamentos} status={status} />}</main></div>
}

export default App
