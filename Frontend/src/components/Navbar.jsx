const items = [
  { id: 'painel', label: 'Tela 1: Visão Geral de Orçamentos' },
  { id: 'oportunidades', label: 'Tela 2: Combinações por Loja' },
]

function Navbar({ activePage, onNavigate }) {
  return (
    <header className="navbar">
      <a className="brand" href="#inicio" aria-label="OrquestraCompras, início">
        <span className="brand-mark" aria-hidden="true">O</span>
        <span>Orquestra<span>Compras</span></span>
      </a>
      <nav aria-label="Navegação principal">
        {items.map((item) => (
          <button className={activePage === item.id ? 'nav-link active' : 'nav-link'} key={item.id} onClick={() => onNavigate(item.id)} type="button">
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
