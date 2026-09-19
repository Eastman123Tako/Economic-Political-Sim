import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works whether it's served from a domain
  // root or a GitHub Pages project subpath (e.g. /Economic-Political-Sim/).
  base: './',
  plugins: [react()],
})
