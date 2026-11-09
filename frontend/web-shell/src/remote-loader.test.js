import { describe, expect, it, vi } from 'vitest';
import { asLazyComponent, resolveRemoteComponent } from './remote-loader.js';
describe('adaptador de Module Federation', () => {
  it('resolve o formato real do container Vite Federation: namespace com App nomeado', async () => {
    const App = () => null;
    const federationModule = Object.freeze({ App });
    await expect(asLazyComponent('mfeConta/App', async () => federationModule)).resolves.toEqual({ default: App });
  });
  it('prioriza App válido sobre default que é objeto de namespace', () => {
    const App = () => null;
    expect(resolveRemoteComponent('mfeOrcamentos/App', { App, default: { App: vi.fn() } })).toBe(App);
  });
  it('aceita o componente App aninhado em um wrapper default', () => {
    const App = () => null;
    expect(resolveRemoteComponent('mfeConta/App', { default: { App } })).toBe(App);
  });
  it('preserva um default que seja realmente componente React', async () => {
    const App = () => null;
    await expect(asLazyComponent('mfeConta/App', async () => ({ default: App }))).resolves.toEqual({ default: App });
  });
  it('rejeita objeto de namespace sem componente em vez de entregá-lo ao React.lazy', () => {
    expect(() => resolveRemoteComponent('mfeOrcamentos/App', { default: { value: 'inválido' } })).toThrow('mfeOrcamentos/App');
  });
});
