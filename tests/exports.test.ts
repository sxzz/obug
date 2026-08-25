import { describe, expect, it } from 'vitest'
import pkg from '../package.json'

/**
 * Walks the conditional `.` export the way the Node.js/bundler exports
 * algorithm does: first key that is `default` or an active condition wins.
 */
function resolveEntry(conditions: string[]): string {
  const map: Record<string, string> = pkg.exports['.']
  for (const [condition, target] of Object.entries(map)) {
    if (condition === 'default' || conditions.includes(condition)) {
      return target
    }
  }
  throw new Error(`no export matched conditions: ${conditions.join(', ')}`)
}

const NODE = './dist/node.js'
const BROWSER = './dist/browser.js'

describe('package exports', () => {
  it('serves the node build only to runtimes asking for it', () => {
    expect(resolveEntry(['node', 'import'])).toBe(NODE)
    expect(resolveEntry(['node', 'require'])).toBe(NODE)
    expect(resolveEntry(['webpack', 'node', 'import', 'module'])).toBe(NODE)
  })

  it('serves the browser build to everything else', () => {
    // Metro applies neither `node` nor `browser` on native platforms, so a
    // `default` pointing at the node build breaks React Native and Expo.
    expect(resolveEntry(['require', 'import'])).toBe(BROWSER)
    expect(resolveEntry(['browser', 'import'])).toBe(BROWSER)
    expect(resolveEntry(['workerd', 'worker', 'browser', 'import'])).toBe(
      BROWSER,
    )
    expect(resolveEntry([])).toBe(BROWSER)
  })

  it('prefers the browser build when both conditions apply', () => {
    // e.g. webpack's electron-renderer target, where `node:tty` may be absent
    expect(resolveEntry(['electron', 'browser', 'node', 'import'])).toBe(
      BROWSER,
    )
  })

  it('points the legacy `browser` field at the browser build', () => {
    // Metro falls back to resolverMainFields when package exports are disabled
    expect(pkg.browser).toBe(BROWSER)
  })
})
