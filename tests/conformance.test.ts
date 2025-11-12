import { createRequire } from 'node:module'
import { describe, expect, test } from 'vitest'

const require = createRequire(import.meta.url)

const removedAPIs = new Set([
  'destroy', //deprecated
  'coerce', // private API
  'humanize', // private API
  'init', // private API
  'save', // private API
  'load', // private API
  'colors', // private API
  'useColors', // private API
  'inspectOpts', // private API
])

describe('conformance', () => {
  test('require: same exports', () => {
    const debug = require('debug')
    const obugNode = require('../dist/node')
    const debugKeys = Object.keys(debug)
      .filter((key) => !removedAPIs.has(key))
      .sort()
    const obugKeys = Object.keys(obugNode)
      .filter((k) => k !== 'inspectOpts')
      .sort()
    expect(obugKeys).toEqual(debugKeys)

    const obugBrowser = require('../dist/browser')
    expect(Object.keys(obugBrowser).sort()).toEqual(obugKeys)
  })

  test('import: same exports', async () => {
    const debug = await import('debug')
    const obug = await import('../dist/node')
    const debugKeys = Object.keys(debug)
      .filter((key) => !removedAPIs.has(key))
      .sort()
    const obugKeys = Object.keys(obug)
      .filter((key) => key !== 'createDebug' && key !== 'module.exports')
      .sort()
    expect(obugKeys).toEqual(debugKeys)

    const obugBrowser = await import('../dist/browser')
    expect(Object.keys(obugBrowser).sort()).toEqual(Object.keys(obug).sort())
  })
})
