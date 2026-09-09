import { describe, expect, it } from 'vitest'
import { coerce, humanize, matchesTemplate, selectColor } from '../src/utils'

describe('utils', () => {
  it('coerces errors using the stack or message and preserves other values', () => {
    const error = new Error('failure')
    expect(coerce(error)).toBe(error.stack)
    // eslint-disable-next-line unicorn/no-error-property-assignment -- Exercise errors without stack traces.
    error.stack = ''
    expect(coerce(error)).toBe('failure')
    const value = { ok: true }
    expect(coerce(value)).toBe(value)
    expect(coerce(null)).toBeNull()
  })

  it('selects stable colors for empty, short and overflowing hashes', () => {
    expect(selectColor(['red', 'green', 'blue'], '')).toBe('red')
    expect(selectColor(['red', 'green', 'blue'], 'a')).toBe('green')
    expect(selectColor([1, 2, 3], 'abcdef')).toBe(2)
  })

  it.each([
    ['', '', true],
    ['', '*', true],
    ['', '**', true],
    ['', 'a', false],
    ['a', '', false],
    ['abc', 'abc', true],
    ['abc', 'abd', false],
    ['abc', 'ab', false],
    ['ab', 'abc', false],
    ['abc', '*', true],
    ['abc', 'a**', true],
    ['abc', '*c', true],
    ['abc', '*d', false],
    ['ababc', '*abc', true],
    ['abcXYZdef', 'a*c*def', true],
    ['abc', 'a*d', false],
  ])('matches %j against %j: %s', (search, template, expected) => {
    expect(matchesTemplate(search, template)).toBe(expected)
  })

  it.each([
    [0, '0ms'],
    [999, '999ms'],
    [1000, '1.0s'],
    [1250, '1.3s'],
  ])('humanizes %s as %s', (value, expected) => {
    expect(humanize(value)).toBe(expected)
  })
})
