import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react({ jsxRuntime: 'classic' })],
  esbuild: {
    jsxInject: `import React from 'react'`, // Auto-inject React where needed
  },
})
