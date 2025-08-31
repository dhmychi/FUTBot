import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log environment variables for debugging
  console.log('PayPal Client ID from Vite Config:', env.VITE_PAYPAL_CLIENT_ID);
  
  return {
    base: '/', // Vercel deployment - use root
    plugins: [
      react()
    ],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      fs: {
        allow: ['..']
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true, // Enable sourcemaps for debugging
      emptyOutDir: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      rollupOptions: {
        input: {
          main: './index.html'
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@paypal/react-paypal-js', 'axios']
          }
        }
      }
    },
    resolve: {
      alias: [
        { find: '@', replacement: '/src' },
        { find: /^~(.+)/, replacement: '$1' }
      ]
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['lucide-react']
    }
  };
});
