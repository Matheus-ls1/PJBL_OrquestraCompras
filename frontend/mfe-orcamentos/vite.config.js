import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
export default defineConfig({ plugins: [react(), federation({ name: 'mfeOrcamentos', filename: 'remoteEntry.js', dts: false, exposes: { './App': './src/App.jsx' }, shared: { react: { singleton: true }, 'react-dom': { singleton: true } } })], server: { port: 5175 }, test: { environment: 'jsdom', globals: true } });
