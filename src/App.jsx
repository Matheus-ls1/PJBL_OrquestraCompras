import { useState } from 'react'
import Navbar from './components/Navbar'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import OportunidadesPage from './pages/OportunidadesPage'

const pages = { oportunidades: OportunidadesPage, configuracoes: ConfiguracaoPage }

function App() {
  const [activePage, setActivePage] = useState('oportunidades')
  const ActivePage = pages[activePage]
  return <div className="app-shell"><Navbar activePage={activePage} onNavigate={setActivePage} /><main className="page-container"><ActivePage /></main></div>
}

export default App
