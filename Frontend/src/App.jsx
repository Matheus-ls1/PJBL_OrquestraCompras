import { useState } from 'react'
import Navbar from './components/Navbar'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import OportunidadesPage from './pages/OportunidadesPage'

function App() {
  const [activePage, setActivePage] = useState('painel')
  return <div className="app-shell"><Navbar activePage={activePage} onNavigate={setActivePage} /><main className="page-container">{activePage === 'painel' ? <ConfiguracaoPage /> : <OportunidadesPage />}</main></div>
}

export default App
