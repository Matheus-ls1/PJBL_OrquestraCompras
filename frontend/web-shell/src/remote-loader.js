const REACT_COMPONENT_SYMBOLS = new Set([
  Symbol.for('react.memo'),
  Symbol.for('react.forward_ref'),
  Symbol.for('react.lazy')
]);

export const isReactComponent = candidate => typeof candidate === 'function'
  || Boolean(candidate && typeof candidate === 'object' && REACT_COMPONENT_SYMBOLS.has(candidate.$$typeof));

const diagnostics = (remoteName, module, selected) => ({
  remote: remoteName,
  exports: module && typeof module === 'object' ? Object.keys(module) : [],
  defaultType: typeof module?.default,
  appType: typeof module?.App,
  defaultAppType: typeof module?.default?.App,
  selectedType: typeof selected
});

export const resolveRemoteComponent = (remoteName, module) => {
  // The Vite Federation container exposes ./App as a namespace object: { App }.
  // Prefer that explicit component over a possible default namespace wrapper.
  const candidates = [module?.App, module?.default?.App, module?.default];
  const component = candidates.find(isReactComponent);

  if (import.meta.env.DEV) console.debug('[Web Shell][remote]', diagnostics(remoteName, module, component));

  if (!component) {
    const { exports, defaultType, appType, defaultAppType } = diagnostics(remoteName, module);
    throw new Error(`O remote "${remoteName}" não exporta um componente React válido (exports: ${exports.join(', ') || 'nenhum'}; default: ${defaultType}; App: ${appType}; default.App: ${defaultAppType}).`);
  }

  return component;
};

export const asLazyComponent = (remoteName, remoteImport) => remoteImport().then(module => ({
  default: resolveRemoteComponent(remoteName, module)
}));
