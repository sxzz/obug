import type { UserConfig } from 'tsdown'

const config: UserConfig = {
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
}

export default config
