import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/{browser,node}.ts'],
  platform: 'neutral',
  target: 'es2015',
  dts: true,
  external: (id, importer) => {
    if (importer?.endsWith('node.ts') && id.startsWith('node:')) {
      return true
    }
  },
  hash: false,
})
