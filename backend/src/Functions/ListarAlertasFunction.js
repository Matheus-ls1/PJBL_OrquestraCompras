import { app } from '@azure/functions'
import { ListarAlertasQuery } from '../Features/ListarAlertas/ListarAlertasQuery.js'
import { getApplication } from '../Infrastructure/CompositionRoot.js'
import { json, mapError } from '../Infrastructure/Http/httpResponse.js'

app.http('ListarAlertas', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'alertas',
  handler: async (_request, context) => {
    try {
      const alertas = await getApplication().listarAlertas.execute(new ListarAlertasQuery())
      return json(200, { alertas })
    } catch (error) {
      return mapError(error, context)
    }
  },
})
