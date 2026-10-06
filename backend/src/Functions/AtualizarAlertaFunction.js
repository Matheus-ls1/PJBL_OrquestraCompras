import { app } from '@azure/functions'
import { paraAlertaResponse } from '../Features/ListarAlertas/AlertaResponse.js'
import { getApplication } from '../Infrastructure/CompositionRoot.js'
import { json, mapError } from '../Infrastructure/Http/httpResponse.js'

app.http('AtualizarAlerta', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'alertas',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const alerta = await getApplication().atualizarOrcamento.execute({
        id: request.query.get('id'),
        orcamentoAlvo: Number(body.orcamentoAlvo),
      })
      return json(200, paraAlertaResponse(alerta))
    } catch (error) {
      return mapError(error, context)
    }
  },
})
