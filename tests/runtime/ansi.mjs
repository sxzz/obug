import { createDebug } from 'obug'

const messages = []
const log = createDebug('runtime', {
  color: 200,
  useColors: true,
  log: (...args) => messages.push(args),
})

log.enabled = true
log('hello')

const output = messages.flat().map(String).join(' ')

if (output.includes('%c')) {
  throw new Error(
    `Expected ANSI output, got browser formatting: ${JSON.stringify(messages)}`,
  )
}

if (!output.includes('\u001B[')) {
  throw new Error(`Expected ANSI output, got: ${JSON.stringify(messages)}`)
}
