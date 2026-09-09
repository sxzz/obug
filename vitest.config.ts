import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        'src/{core,utils}.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
          perFile: true,
        },
      },
    },
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/basic.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
              { browser: 'firefox' },
              { browser: 'webkit' },
            ],
            headless: true,
          },
        },
      },
    ],
  },
})
