export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'OrquestraCompras BFF', version: '0.2.0', description: 'Entrada pública e agregação de dados distribuídos.' },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      ResumoFinanceiro: {
        type: 'object', required: ['totalOrcamentos', 'somaLimites', 'mediaLimites', 'origem', 'tipoAnalise'],
        properties: {
          totalOrcamentos: { type: 'integer', example: 2 }, somaLimites: { type: 'number', example: 8000 },
          mediaLimites: { type: 'number', example: 4000 }, origem: { type: 'string', example: 'azure-function' },
          tipoAnalise: { type: 'string', example: 'RESUMO_FINANCEIRO' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: { summary: 'Verifica a disponibilidade do BFF', responses: { 200: { description: 'Processo ativo' } } }
    },
    '/aggregated-data': {
      get: {
        summary: 'Agrega perfil, orçamentos e resumo financeiro',
        description: 'Consulta Identity Service e Budget Service com o JWT recebido e envia limites válidos para a Azure Function. As três fontes são obrigatórias.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dados agregados', content: { 'application/json': { schema: { type: 'object', required: ['usuario', 'orcamentos', 'resumoFinanceiro'], properties: { usuario: { type: 'object' }, orcamentos: { type: 'array', items: { type: 'object' } }, resumoFinanceiro: { $ref: '#/components/schemas/ResumoFinanceiro' } } } } } },
          401: { description: 'Bearer ausente ou rejeitado pelo serviço de identidade' },
          502: { description: 'Uma dependência obrigatória retornou falha ou contrato inválido' },
          504: { description: 'Tempo limite de uma dependência excedido' }
        }
      }
    }
  }
};
