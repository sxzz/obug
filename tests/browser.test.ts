import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDebug } from '../src/browser'

function capture(log: ReturnType<typeof createDebug>): any[] {
  const messages: any[][] = []
  log.enabled = true
  log.log = (...args: any[]) => messages.push(args)
  log('hello world')
  expect(messages).toHaveLength(1)
  return messages[0]
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('debug browser', () => {
  it('omits `%c` directives when the console cannot style them', () => {
    // The node environment has no `document`, standing in for React Native and
    // other DOM-less runtimes, which print the directives verbatim.
    const args = capture(createDebug('dom-less'))

    expect(args).toHaveLength(1)
    expect(args[0]).not.toContain('%c')
  })

  it('emits `%c` directives for a developer tools console', async () => {
    vi.stubGlobal('document', {})
    vi.resetModules()
    const browser = await import('../src/browser.ts')

    const args = capture(browser.createDebug('browser'))

    expect(args[0]).toContain('%c')
    expect(args.slice(1)).toContain('color: inherit')
  })
})
