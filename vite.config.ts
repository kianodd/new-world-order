import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/new-world-order/',
  // @ts-expect-error vitest field
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
