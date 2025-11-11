import { afterEach } from 'node:test'
import { formatWithOptions } from 'node:util'
import { describe, expect, it, vi } from 'vitest'
import debug from '../src/node'
import type { InspectOptions } from '../src/types'

vi.mock('node:util', async (importActual) => {
  const actual = await importActual<typeof import('node:util')>()
  return {
    ...actual,
    formatWithOptions: vi.fn(actual.formatWithOptions),
  }
})
vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

afterEach(() => {
  vi.resetAllMocks()
})

describe('debug node', () => {
  describe('formatting options', () => {
    it('calls util.formatWithOptions', () => {
      debug.enable('*')
      const log = debug('formatting options')
      log('hello world')
      expect(formatWithOptions).toBeCalledTimes(1)
    })

    it('calls util.formatWithOptions with inspectOpts', () => {
      debug.enable('*')

      const options: InspectOptions = {
        hideDate: true,
        colors: true,
        depth: 10,
        showHidden: true,
      }
      Object.assign(debug.inspectOpts!, options)

      const log = debug('format with inspectOpts')
      log('hello world2')
      // assert.deepStrictEqual(util.formatWithOptions.getCall(0).args[0], options)
      expect(formatWithOptions).toHaveBeenNthCalledWith(
        1,
        options,
        expect.stringMatching(/.+ formatting options hello world$/),
      )
    })
  })
})
