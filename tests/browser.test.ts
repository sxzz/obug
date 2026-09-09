import { describe, expect, it } from 'vitest'
import { createDebug } from '../src/browser'
import { createDebug as createReactNativeDebug } from '../src/plain'

describe('browser runtime', () => {
  it('uses CSS console formatting by default', () => {
    expect(createDebug('browser').useColors).toBe(true)
  })

  it('does not emit CSS console formatting in React Native', () => {
    expect(createReactNativeDebug('react-native').useColors).toBe(false)
  })

  it('keeps plain output independent of browser debugger options', () => {
    const messages: any[][] = []
    const plain = createReactNativeDebug('plain', {
      log: (...args) => messages.push(args),
      humanize: () => '0ms',
    })
    plain.enabled = true
    const browser = createDebug('browser', { useColors: true })
    plain('hello %j', { ok: true })
    const child = plain.extend('child')
    child.enabled = true
    child('world')
    expect(messages[0]).toEqual(['plain hello {"ok":true} +0ms'])
    expect(messages[1]).toEqual(['plain:child world +0ms'])
    expect(browser.useColors).toBe(true)
    expect(createReactNativeDebug('another').useColors).toBe(false)
  })
})
