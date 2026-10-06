import { app } from '@azure/functions'
import { getApplication } from '../Infrastructure/CompositionRoot.js'
import { json, mapError } from '../Infrastructure/Http/httpResponse.js'

app.http('ExcluirAlerta', {
  methods: ['DELETE'],
  authLevel: 'function',
  route: 'alertas',
  handler: async (request, context) => {
    try {
      await getApplication().excluirAlerta.execute({ id: request.query.get('id') })
      return json(204, null)
    } catch (error) {
      return mapError(error, context)
    }
  },
})
