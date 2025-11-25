import { isatty } from 'node:tty'
import { formatWithOptions, inspect } from 'node:util'
import {
  createDebug as _createDebug,
  enable as _enable,
  disable,
  enabled,
  namespaces,
} from './core.ts'
import { humanize, selectColor } from './utils.ts'
import type { Debugger, DebugOptions, InspectOptions } from './types.ts'

const colors: number[] =
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
  .filter((key) => /^debug_/i.test(key))
  .reduce<Record<string, any>>((obj, key) => {
    // Camel-case
    const prop = key
      .slice(6)
      .toLowerCase()
      .replace(/_([a-z])/g, (_, k) => k.toUpperCase())

    // Coerce string value into JS value
    let value: any = process.env[key]
    const lowerCase = typeof value === 'string' && value.toLowerCase()
    if (value === 'null') {
      value = null
    } else if (
      lowerCase === 'yes' ||
      lowerCase === 'on' ||
      lowerCase === 'true' ||
      lowerCase === 'enabled'
    ) {
      value = true
    } else if (
      lowerCase === 'no' ||
      lowerCase === 'off' ||
      lowerCase === 'false' ||
      lowerCase === 'disabled'
    ) {
      value = false
    } else {
      value = Number(value)
    }

    obj[prop] = value
    return obj
  }, Object.create(null))

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */
function useColors(): boolean {
  return 'colors' in inspectOpts
    ? Boolean(inspectOpts.colors)
    : isatty(process.stderr.fd)
}

function getDate(): string {
  if (inspectOpts.hideDate) {
    return ''
  }
  return `${new Date().toISOString()} `
}

/**
 * Adds ANSI color escape codes if enabled.
 */
function formatArgs(
  this: Debugger,
  diff: number,
  args: [string, ...any[]],
): void {
  const { namespace: name, useColors } = this

  if (useColors) {
    const c = this.color as number
    const colorCode = `\u001B[3${c < 8 ? c : `8;5;${c}`}`
    const prefix = `  ${colorCode};1m${name} \u001B[0m`

    args[0] = prefix + args[0].split('\n').join(`\n${prefix}`)
    args.push(`${colorCode}m+${this.humanize(diff)}\u001B[0m`)
  } else {
    args[0] = `${getDate()}${name} ${args[0]}`
  }
}

function log(this: Debugger, ...args: any[]): void {
  process.stderr.write(`${formatWithOptions(this.inspectOpts, ...args)}\n`)
}

const defaultOptions: Omit<Required<DebugOptions>, 'color'> = {
  useColors: useColors(),

  formatArgs,
  formatters: {
    /**
     * Map %o to `util.inspect()`, all on a single line.
     */
    o(v) {
      this.inspectOpts.colors = this.useColors
      return inspect(v, this.inspectOpts)
        .split('\n')
        .map((str) => str.trim())
        .join(' ')
    },

    /**
     * Map %O to `util.inspect()`, allowing multiple lines if needed.
     */
    O(v) {
      this.inspectOpts.colors = this.useColors
      return inspect(v, this.inspectOpts)
    },
  },
  inspectOpts,

  log,
  humanize,
}

export function createDebug(
  namespace: string,
  options?: DebugOptions,
): Debugger {
  const color = (options && options.color) ?? selectColor(colors, namespace)
  return _createDebug(
    namespace,
    Object.assign(defaultOptions, { color }, options),
  )
}

function save(namespaces: string): void {
  if (namespaces) {
    process.env.DEBUG = namespaces
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 */
function enable(namespaces: string): void {
  save(namespaces)
  _enable(namespaces)
}

// side-effect
_enable(process.env.DEBUG || '')

export type * from './types.ts'
export { disable, enable, enabled, namespaces }
