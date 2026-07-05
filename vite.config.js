import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// Builds a single self-contained UMD bundle that can be dropped onto any page
// with a <script> tag. All CSS is inlined into the JS (see cssInjectedByJsPlugin)
// so there is never a separate stylesheet to load, and the styles land inside
// the widget's shadow root rather than leaking onto the host page.
export default defineConfig({
  build: {
    rollupOptions: {
      input: './src/main.jsx',
      output: {
        entryFileNames: 'shadowkit.js',
        name: 'ShadowKit',
        format: 'umd',
      },
    },
    cssCodeSplit: false, // keep everything in one file
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
