import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log environment variables for debugging
  console.log('PayPal Client ID from Vite Config:', env.VITE_PAYPAL_CLIENT_ID);
  
  return {
    base: './', // Use relative paths
    plugins: [react()],
    define: {
      'import.meta.env': {
        VITE_PAYPAL_CLIENT_ID: JSON.stringify(env.VITE_PAYPAL_CLIENT_ID),
        VITE_PAYPAL_ENVIRONMENT: JSON.stringify(env.VITE_PAYPAL_ENVIRONMENT),
        VITE_PAYPAL_CLIENT_SECRET: JSON.stringify(env.VITE_PAYPAL_CLIENT_SECRET)
      }
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      fs: {
        // Allow serving files from one level up from the package root
        allow: ['..']
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@paypal/react-paypal-js', 'axios']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom']
    }
  };
});
