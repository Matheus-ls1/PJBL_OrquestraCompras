function CardAlerta({ alerta }) {
  const title = alerta.nomeProduto || alerta.produto || alerta.nome || 'Produto monitorado'
  const store = alerta.loja || alerta.nomeLoja || 'Loja parceira'
  const price = alerta.preco || alerta.valor || alerta.precoAtual
  return <article className="alert-card"><div className="alert-card-top"><span className="store-badge">{store}</span><span className="status-dot">Disponível</span></div><h3>{title}</h3><p className="card-caption">Oportunidade identificada em uma loja de confiança.</p>{price !== undefined && price !== null && <p className="price">R$ {String(price)}</p>}<button className="outline-button" type="button">Ver oportunidade</button></article>
}

export default CardAlerta
