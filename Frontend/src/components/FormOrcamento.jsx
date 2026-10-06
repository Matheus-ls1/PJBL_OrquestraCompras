import { useState } from 'react'
import { criarAlerta } from '../services/api'

const initialForm = { projeto: '', orcamentoAlvo: '', produtos: '', lojas: '' }

function FormOrcamento({ onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (Object.values(form).some((value) => !value.trim())) {
      setError('Preencha projeto, orçamento, produtos e lojas para continuar.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await criarAlerta({
        projeto: form.projeto.trim(),
        orcamentoAlvo: Number(form.orcamentoAlvo),
        produtos: form.produtos.split(',').map((item) => item.trim()).filter(Boolean),
        lojas: form.lojas.split(',').map((item) => item.trim()).filter(Boolean),
      })
      setForm(initialForm)
      setMessage('Alerta criado com sucesso.')
      await onCreated()
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível criar o alerta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field"><label htmlFor="projeto">Nome do alerta / projeto</label><input id="projeto" name="projeto" value={form.projeto} onChange={updateField} placeholder="Ex.: Sala de estar" required /></div>
      <div className="form-field"><label htmlFor="orcamentoAlvo">Orçamento máximo</label><div className="currency-input"><span>R$</span><input id="orcamentoAlvo" name="orcamentoAlvo" type="number" min="0.01" step="0.01" value={form.orcamentoAlvo} onChange={updateField} placeholder="0,00" required /></div></div>
      <div className="form-field"><label htmlFor="produtos">Produtos (separe por vírgula)</label><input id="produtos" name="produtos" value={form.produtos} onChange={updateField} placeholder="Sofá, tapete, TV" required /></div>
      <div className="form-field"><label htmlFor="lojas">Lojas de confiança (separe por vírgula)</label><input id="lojas" name="lojas" value={form.lojas} onChange={updateField} placeholder="Magazine Luiza, Ponto Frio" required /></div>
      <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? 'Salvando…' : 'Criar alerta'}</button>
      {message && <p className="form-feedback" role="status">{message}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  )
}

export default FormOrcamento
