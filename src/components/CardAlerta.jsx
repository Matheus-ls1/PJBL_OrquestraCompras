import { useState } from 'react'
import { atualizarAlerta, excluirAlerta } from '../services/api'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

function CardAlerta({ alerta, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [orcamentoAlvo, setOrcamentoAlvo] = useState(String(alerta.orcamentoAlvo || ''))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const id = alerta._id || alerta.id

  async function saveBudget() {
    if (!orcamentoAlvo || Number(orcamentoAlvo) <= 0) {
      setError('Informe um orçamento maior que zero.')
      return
    }
    setIsSaving(true); setError('')
    try {
      await atualizarAlerta(id, { orcamentoAlvo: Number(orcamentoAlvo) })
      setEditing(false); setMessage('Orçamento atualizado com sucesso.')
      await onChanged()
    } catch (requestError) { setError(requestError.message || 'Não foi possível atualizar o alerta.') }
    finally { setIsSaving(false) }
  }

  async function removeAlert() {
    setIsSaving(true); setError('')
    try {
      await excluirAlerta(id)
      await onChanged()
    } catch (requestError) { setError(requestError.message || 'Não foi possível excluir o alerta.') }
    finally { setIsSaving(false); setConfirmingDelete(false) }
  }

  return (
    <article className="alert-card">
      <div className="alert-card-top"><span className="store-badge">{alerta.status || 'MONITORADO'}</span><span className="status-dot">Ativo</span></div>
      <h3>{alerta.projeto || alerta.nomeAlerta || 'Alerta sem nome'}</h3>
      <p className="card-caption">Orçamento máximo: <strong>{formatarMoeda(alerta.orcamentoAlvo)}</strong></p>
      <p className="card-caption">Produtos: {(alerta.produtos || []).map((produto) => typeof produto === 'string' ? produto : produto.item || produto.nome).join(', ') || 'Não informado'}</p>
      {editing && <div className="form-field"><label htmlFor={`budget-${id}`}>Novo orçamento</label><input id={`budget-${id}`} type="number" min="0.01" step="0.01" value={orcamentoAlvo} onChange={(event) => setOrcamentoAlvo(event.target.value)} /><button className="primary-button" disabled={isSaving} onClick={saveBudget} type="button">Salvar</button></div>}
      {confirmingDelete && <div className="confirmation-box"><p>Excluir este alerta permanentemente?</p><button className="outline-button" disabled={isSaving} onClick={() => setConfirmingDelete(false)} type="button">Cancelar</button><button className="danger-button" disabled={isSaving} onClick={removeAlert} type="button">Confirmar exclusão</button></div>}
      <div className="card-actions"><button className="outline-button" onClick={() => { setEditing((current) => !current); setConfirmingDelete(false) }} type="button">Editar orçamento</button><button className="danger-button" onClick={() => { setConfirmingDelete((current) => !current); setEditing(false) }} type="button">Excluir</button></div>
      {message && <p className="form-feedback" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}
    </article>
  )
}

export default CardAlerta
