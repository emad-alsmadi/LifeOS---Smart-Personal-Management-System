import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(process.cwd(), 'src/app'),
      '@components': path.resolve(process.cwd(), 'src/components'),
      '@features': path.resolve(process.cwd(), 'src/features'),
      '@hooks': path.resolve(process.cwd(), 'src/hooks'),
      '@lib': path.resolve(process.cwd(), 'src/lib'),
      '@types': path.resolve(process.cwd(), 'src/types'),
      'pages': path.resolve(process.cwd(), 'src/pages'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/api/openrouter': {
        target: 'https://openrouter.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openrouter/, '/api/v1'),
        secure: false,
      },
    },
  },
});
