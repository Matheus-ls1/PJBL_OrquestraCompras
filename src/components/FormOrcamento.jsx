import { useState } from 'react'

function FormOrcamento() {
  const [form, setForm] = useState({ product: '', budget: '' })
  const [submitted, setSubmitted] = useState(false)
  function updateField(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); setSubmitted(false) }
  function handleSubmit(event) { event.preventDefault(); setSubmitted(true) }

  return <form className="budget-form" onSubmit={handleSubmit} noValidate><div className="form-field"><label htmlFor="product">Produto que deseja acompanhar</label><input id="product" name="product" value={form.product} onChange={updateField} placeholder="Ex.: Fone Bluetooth" required aria-invalid={submitted && !form.product} />{submitted && !form.product && <small className="field-error">Informe um produto.</small>}</div><div className="form-field"><label htmlFor="budget">Seu orçamento máximo</label><div className="currency-input"><span>R$</span><input id="budget" name="budget" inputMode="decimal" value={form.budget} onChange={updateField} placeholder="0,00" required aria-invalid={submitted && !form.budget} /></div>{submitted && !form.budget && <small className="field-error">Informe seu orçamento.</small>}</div><button className="primary-button" type="submit">Criar alerta visual</button>{submitted && form.product && form.budget && <p className="form-feedback" role="status">Dados validados. A criação do alerta será processada pelo serviço da aplicação.</p>}</form>
}

export default FormOrcamento
