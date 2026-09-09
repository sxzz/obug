import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['./src/{ansi,browser,plain}.ts'],
    platform: 'neutral',
    target: 'es2015',
    dts: true,
    deps: {
      neverBundle(id, importer) {
        if (importer?.endsWith('ansi.ts') && id.startsWith('node:')) {
          return true
        }
      },
    },
    hash: false,
    minify: 'dce-only',
  },
  {
    entry: {
      'browser.min': './src/browser.ts',
    },
    platform: 'browser',
    target: 'es2015',
    dts: false,
    minify: true,
  },
])
