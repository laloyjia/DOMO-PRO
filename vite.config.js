import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Esto asegura que Vite maneje el JSX sin errores de "React is not defined"
      jsxRuntime: 'automatic', 
    })
  ],
  build: {
    outDir: 'dist',
  }
})