import { app } from '@azure/functions'
import { CriarAlertaCommand } from '../Features/CriarAlerta/CriarAlertaCommand.js'
import { paraAlertaResponse } from '../Features/ListarAlertas/AlertaResponse.js'
import { getApplication } from '../Infrastructure/CompositionRoot.js'
import { json, mapError } from '../Infrastructure/Http/httpResponse.js'

app.http('CriarAlerta', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'alertas',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const command = new CriarAlertaCommand({
        nomeAlerta: body.nomeAlerta ?? body.projeto,
        orcamentoAlvo: Number(body.orcamentoAlvo),
        produtos: (body.produtos ?? []).map((produto) => typeof produto === 'string' ? { item: produto } : produto),
        lojasConfianca: body.lojasConfianca ?? body.lojas ?? [],
      })
      const alerta = await getApplication().criarAlerta.execute(command)
      return json(201, paraAlertaResponse(alerta))
    } catch (error) {
      return mapError(error, context)
    }
  },
})
