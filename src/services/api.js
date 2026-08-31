import { env, hasApiUrl } from '../config/env'

const mockOrcamento = {
  id: 'alt-demo-001',
  usuario: 'Visitante',
  orcamentoAlvo: 8000,
  valorTotalEncontrado: 7850,
  economia: 150,
  status: 'ALERTA_DISPARADO',
  dataVerificacao: '2026-08-31T22:37:55.902Z',
  lojasSelecionadas: ['Magazine Luiza', 'Ponto Frio', 'MM'],
  produtos: [
    { id: 'produto-demo-001', item: 'Sofá Cinza 3 Lugares', preco: 2500, loja: 'Magazine Luiza' },
    { id: 'produto-demo-002', item: 'Tapete Marrom 200x150cm', preco: 350, loja: 'Ponto Frio' },
    { id: 'produto-demo-003', item: 'Smart TV 50" 4K', preco: 5000, loja: 'Magazine Luiza' },
  ],
}

function obterProdutos(orcamento) {
  const produtos = Array.isArray(orcamento)
    ? orcamento
    : orcamento?.produtos || orcamento?.alertas || orcamento?.data || []

  return produtos.map((produto) => ({
    ...produto,
    produto: produto.produto || produto.nomeProduto || produto.item,
  }))
}

export async function getAlertasOrcamento() {
  try {
    if (!hasApiUrl) throw new Error('VITE_API_URL não foi definida.')

    const response = await fetch(env.apiUrl, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) throw new Error(`A API respondeu com status ${response.status}.`)

    return obterProdutos(await response.json())
  } catch (error) {
    console.warn('Não foi possível consultar a API. Exibindo dados de contingência.', error)
    return obterProdutos(mockOrcamento)
  }
}
