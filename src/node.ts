import { createRequire } from 'node:module'
import { isatty } from 'node:tty'
import { formatWithOptions, inspect } from 'node:util'
import { setup } from './core.ts'
import { humanize as _humanize } from './utils.ts'
import type { Debug, Debugger, InspectOptions } from './types.ts'

const require = createRequire(import.meta.url)

/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */
export function log(...args: any[]): void {
  process.stderr.write(`${formatWithOptions(inspectOpts, ...args)}\n`)
}

export const colors: number[] =
  process.stderr.getColorDepth && process.stderr.getColorDepth() > 2
    ? [
        20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63,
        68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128,
        129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168,
        169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200,
        201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221,
      ]
    : [6, 2, 3, 4, 5, 1]

const inspectOpts: InspectOptions = Object.keys(process.env)
  .filter((key) => {
    return /^debug_/i.test(key)
  })
  .reduce(
    (obj, key) => {
      // Camel-case
      const prop = key
        .slice(6)
        .toLowerCase()
        .replace(/_([a-z])/g, (_, k) => k.toUpperCase())

      // Coerce string value into JS value
      let value: any = process.env[key]
      if (value === 'null') {
        value = null
      } else if (/^yes|on|true|enabled$/i.test(value)) {
        value = true
      } else if (/^no|off|false|disabled$/i.test(value)) {
        value = false
      } else {
        value = Number(value)
      }

      obj[prop] = value
      return obj
    },
    {} as Record<string, any>,
  )

/**
 * Load `namespaces`.
 */
function load(): string {
  return process.env.DEBUG || ''
}

function save(namespaces: string) {
  if (namespaces) {
    process.env.DEBUG = namespaces
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG
  }
}

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */
export function useColors(): boolean {
  return 'colors' in inspectOpts
    ? Boolean(inspectOpts.colors)
    : isatty(process.stderr.fd)
}

let humanize: typeof _humanize
try {
  humanize = require('ms')
} catch {
  humanize = _humanize
}

/**
 * Adds ANSI color escape codes if enabled.
 */
export function formatArgs(this: Debugger, args: [string, ...any[]]): void {
  const { namespace: name, useColors } = this

  if (useColors) {
    const c = this.color as number
    const colorCode = `\u001B[3${c < 8 ? c : `8;5;${c}`}`
    const prefix = `  ${colorCode};1m${name} \u001B[0m`

    args[0] = prefix + args[0].split('\n').join(`\n${prefix}`)
    args.push(`${colorCode}m+${humanize(this.diff!)}\u001B[0m`)
  } else {
    args[0] = `${getDate()}${name} ${args[0]}`
  }
}

function getDate(): string {
  if (inspectOpts.hideDate) {
    return ''
  }
  return `${new Date().toISOString()} `
}

function init(debug: Debugger) {
  debug.inspectOpts = Object.assign({}, inspectOpts)
}

export const createDebug: Debug = setup(
  useColors(),
  colors,
  log,
  load,
  save,
  formatArgs,
  init,
)

createDebug.inspectOpts = inspectOpts

/**
 * Map %o to `util.inspect()`, all on a single line.
 */
createDebug.formatters.o = function (v) {
  this.inspectOpts!.colors = this.useColors
  return inspect(v, this.inspectOpts)
    .split('\n')
    .map((str) => str.trim())
    .join(' ')
}

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */
createDebug.formatters.O = function (v) {
  this.inspectOpts!.colors = this.useColors
  return inspect(v, this.inspectOpts)
}

export default createDebug
export type * from './types.ts'
