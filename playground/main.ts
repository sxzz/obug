import { Debug } from '../src/browser'

Debug.enable('test,test:subnamespace')
const debug = Debug('test')
debug('Hello World')

debug('Hello %s', 'Kevin')
debug('This is a number: %d', 42)
debug('This is a float: %f', 3.14159)
debug('This is an object: %O', { a: 1, b: 2 })
debug('This is a string: %s', 'sample string')
debug('This is a JSON: %j', { key: 'value' })

const subnamespace = debug.extend('subnamespace')
subnamespace('This is from subnamespace')
