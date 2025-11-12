import { formatWithOptions } from 'node:util'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebug, enable } from '../src/node'
import type { InspectOptions } from '../src/types'

vi.mock('node:util', async (importActual) => {
  const actual = await importActual<typeof import('node:util')>()
  return {
    ...actual,
    formatWithOptions: vi.fn(actual.formatWithOptions),
  }
})

vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('debug node', () => {
  describe('formatting options', () => {
    it('calls util.formatWithOptions', () => {
      enable('*')
      const log = createDebug('formatting options')
      log('hello world')
      expect(formatWithOptions).toBeCalledTimes(1)
    })

    it('calls util.formatWithOptions with inspectOpts', () => {
      enable('*')

      const options: InspectOptions = {
        hideDate: true,
        colors: true,
        depth: 10,
        showHidden: true,
      }
      const log = createDebug('format with inspectOpts', {
        inspectOpts: options,
      })
      log('hello world2')

      expect(formatWithOptions).toHaveBeenNthCalledWith(
        1,
        options,
        expect.stringMatching(/.+ format with inspectOpts hello world2$/),
      )
    })
  })
})
