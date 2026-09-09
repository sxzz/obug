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
})
