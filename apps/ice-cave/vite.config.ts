import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Built into the labs repo's /ice-cave/ route as plain static files.
export default defineConfig({
  plugins: [react()],
  base: '/ice-cave/',
  build: {
    outDir: '../../ice-cave',
    emptyOutDir: true,
  },
})
