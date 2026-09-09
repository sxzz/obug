import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebug, disable, enable, enabled, namespaces } from '../src/core'
import { humanize } from '../src/utils'
import type { Debugger, DebugOptions } from '../src/types'

function setup(overrides: DebugOptions = {}) {
  const log = vi.fn()
  const formatArgs = vi.fn()
  const options = {
    useColors: false,
    color: '',
    formatArgs,
    formatters: {},
    inspectOpts: {},
    humanize,
    log,
    ...overrides,
  }
  return { debug: createDebug('app', options), log, formatArgs }
}

beforeEach(() => enable(''))
afterEach(() => {
  disable()
  vi.restoreAllMocks()
})

describe('core', () => {
  it('updates existing debuggers on namespace changes and honors overrides', () => {
    const { debug, log, formatArgs } = setup()
    debug('ignored')
    expect(log).not.toHaveBeenCalled()
    expect(formatArgs).not.toHaveBeenCalled()
    enable('app')
    expect(debug.enabled).toBe(true)
    expect(debug.enabled).toBe(true)
    debug('enabled')
    disable()
    expect(debug.enabled).toBe(false)
    debug.enabled = true
    debug('forced')
    enable('*')
    debug.enabled = false
    debug('suppressed')
    expect(log.mock.calls).toEqual([['enabled'], ['forced']])
  })

  it('preserves namespaces and prioritizes exclusions over wildcards', () => {
    enable(' app:* , other  -app:secret ')
    expect(namespaces()).toBe(' app:* , other  -app:secret ')
    expect(enabled('app:public')).toBe(true)
    expect(enabled('app:secret')).toBe(false)
    expect(enabled('other')).toBe(true)
    expect(enabled('missing')).toBe(false)
    expect(disable()).toBe('app:*,other,-app:secret')
    expect(namespaces()).toBe('')
    expect(enabled('other')).toBe(false)
  })

  it('tracks elapsed time between emitted messages', () => {
    const now = vi.spyOn(Date, 'now')
    const { debug, formatArgs } = setup()
    debug.enabled = true
    now.mockReturnValue(1000)
    debug('first')
    now.mockReturnValue(1250)
    debug('second')
    expect(formatArgs.mock.calls).toEqual([
      [0, ['first']],
      [250, ['second']],
    ])
  })

  it('inlines custom formatters without consuming escaped or native arguments', () => {
    const formatter = vi.fn(function (this: Debugger, value: unknown) {
      return `${this.namespace}:${String(value)}`
    })
    const { debug, log } = setup({ formatters: { x: formatter } })
    debug.enabled = true
    debug('%% %s %x %x', 'native', 1, 2)
    expect(log).toHaveBeenCalledWith('% %s app:1 app:2', 'native')
    expect(formatter.mock.calls).toEqual([[1], [2]])
    expect(formatter.mock.contexts).toEqual([debug, debug])
  })

  it('prepends the object formatter for non-string arguments', () => {
    const { debug, log } = setup()
    debug.enabled = true
    const value = { ok: true }
    debug(value)
    expect(log).toHaveBeenCalledWith('%O', value)
  })
})
