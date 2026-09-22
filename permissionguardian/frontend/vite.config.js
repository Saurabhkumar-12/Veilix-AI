import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from both root directory and frontend directory
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '../'), '');
  const frontendEnv = loadEnv(mode, path.resolve(__dirname, './'), '');
  const googleClientId = frontendEnv.VITE_GOOGLE_CLIENT_ID || rootEnv.VITE_GOOGLE_CLIENT_ID || rootEnv.GOOGLE_CLIENT_ID || '';

  return {
    envDir: path.resolve(__dirname, '../'),
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId)
    },
    server: {
      port: 5175,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});


