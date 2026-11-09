import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), federation({ name: 'webShell', dts: false, remotes: { mfeConta: { type: 'module', name: 'mfeConta', entry: env.VITE_MFE_CONTA_URL || 'http://localhost:5174/remoteEntry.js' }, mfeOrcamentos: { type: 'module', name: 'mfeOrcamentos', entry: env.VITE_MFE_ORCAMENTOS_URL || 'http://localhost:5175/remoteEntry.js' } }, shared: { react: { singleton: true }, 'react-dom': { singleton: true } } })], server: { port: 5173 } };
});
