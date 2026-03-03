import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Añade esta parte para forzar el runtime automático
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})