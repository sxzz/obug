import { assert, describe, it } from 'vitest'

const { createDebug, enable, disable } = (await import(
  globalThis.process ? '../src/node' : '../src/browser'
)) as typeof import('../src/node')

describe('basic', () => {
  it('passes a basic sanity check', () => {
    const log = createDebug('test')
    log.enabled = true
    log.log = () => {}

    assert.doesNotThrow(() => log('hello world'))
  })

  it('honors global debug namespace enable calls', () => {
    assert.deepStrictEqual(createDebug('test:12345').enabled, false)
    assert.deepStrictEqual(createDebug('test:67890').enabled, false)

    enable('test:12345')
    assert.deepStrictEqual(createDebug('test:12345').enabled, true)
    assert.deepStrictEqual(createDebug('test:67890').enabled, false)
  })

  it('uses custom log function', () => {
    const log = createDebug('test')
    log.enabled = true

    const messages = []
    log.log = (...args: any[]) => messages.push(args)

    log('using custom log function')
    log('using custom log function again')
    log('%O', 12345)

    assert.deepStrictEqual(messages.length, 3)
  })

  describe('extend namespace', () => {
    it('should extend namespace', () => {
      const log = createDebug('foo')
      log.enabled = true
      log.log = () => {}

      const logBar = log.extend('bar')
      assert.deepStrictEqual(logBar.namespace, 'foo:bar')
    })

    it('should extend namespace with custom delimiter', () => {
      const log = createDebug('foo')
      log.enabled = true
      log.log = () => {}

      const logBar = log.extend('bar', '--')
      assert.deepStrictEqual(logBar.namespace, 'foo--bar')
    })

    it('should extend namespace with empty delimiter', () => {
      const log = createDebug('foo')
      log.enabled = true
      log.log = () => {}

      const logBar = log.extend('bar', '')
      assert.deepStrictEqual(logBar.namespace, 'foobar')
    })

    it('should keep the log function between extensions', () => {
      const log = createDebug('foo')
      log.log = () => {}

      const logBar = log.extend('bar')
      assert.deepStrictEqual(log.log, logBar.log)
    })
  })

  describe('rebuild namespaces string (disable)', () => {
    it('handle names, skips, and wildcards', () => {
      enable('test,abc*,-abc')
      const namespaces = disable()
      assert.deepStrictEqual(namespaces, 'test,abc*,-abc')
    })

    it('handles empty', () => {
      enable('')
      const namespaces = disable()
      assert.deepStrictEqual(namespaces, '')
    })

    it('handles all', () => {
      enable('*')
      const namespaces = disable()
      assert.deepStrictEqual(namespaces, '*')
    })

    it('handles skip all', () => {
      enable('-*')
      const namespaces = disable()
      assert.deepStrictEqual(namespaces, '-*')
    })

    it('names+skips same with new string', () => {
      enable('test,abc*,-abc')
      const namespaces = disable()
      assert.deepStrictEqual(namespaces, 'test,abc*,-abc')
      enable(namespaces)
    })

    // it('handles re-enabling existing instances', () => {
    //   debug.disable('*')
    //   const inst = debug('foo')
    //   const messages = []
    //   inst.log = (msg) => messages.push(msg.replace(/^[^@]*@([^@]+)@.*$/, '$1'))

    //   inst('@test@')
    //   assert.deepStrictEqual(messages, [])
    //   debug.enable('foo')
    //   assert.deepStrictEqual(messages, [])
    //   inst('@test2@')
    //   assert.deepStrictEqual(messages, ['test2'])
    //   inst('@test3@')
    //   assert.deepStrictEqual(messages, ['test2', 'test3'])
    //   debug.disable('*')
    //   inst('@test4@')
    //   assert.deepStrictEqual(messages, ['test2', 'test3'])
    // })
  })
})
