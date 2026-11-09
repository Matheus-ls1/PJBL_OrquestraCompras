import { avaliarCesta } from '../../domain/regras-de-compra.js';
export const criarFallbackHeuristico = input => ({ ...avaliarCesta(input), origemAnalise: 'FALLBACK_HEURISTICO' });
