import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': '/src/app',
      '@components': '/src/components',
      '@features': '/src/features',
      '@hooks': '/src/hooks',
      '@lib': '/src/lib',
      '@types': '/src/types',
      pages: '/src/pages',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
