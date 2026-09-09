import {
  createDebug as _createDebug,
  enable as _enable,
  disable,
  enabled,
  namespaces,
} from './core.ts'
import { humanize } from './utils.ts'
import type { Debugger, DebugOptions } from './types.ts'

function formatArgs(
  this: Debugger,
  diff: number,
  args: [string, ...any[]],
): void {
  args[0] = `${this.namespace} ${args[0]} +${this.humanize(diff)}`
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 */
const log = console.debug || console.log || (() => {})

const defaultOptions: Required<DebugOptions> = {
  useColors: false,
  color: '',

  formatArgs,
  formatters: {
    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */
    j(v) {
      try {
        return JSON.stringify(v)
      } catch (error: any) {
        return `[UnexpectedJSONParseError]: ${error.message}`
      }
    },
  },
  inspectOpts: {},
  humanize,

  log,
}

export function createDebug(
  namespace: string,
  options?: DebugOptions,
): Debugger {
  return _createDebug(namespace, Object.assign({}, defaultOptions, options))
}

function load(): string {
  let r: string | null | undefined
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context.
    r = localStorage.getItem('debug') || localStorage.getItem('DEBUG')
  } catch {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG
  }

  return r || ''
}

function save(namespaces: string) {
  try {
    if (namespaces) {
      localStorage.setItem('debug', namespaces)
    } else {
      localStorage.removeItem('debug')
    }
  } catch {
    // Swallow
    // XXX (@Qix-) should we be logging these?
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

// eslint-disable-next-line unicorn/no-top-level-side-effects
_enable(load())

export type * from './types.ts'
export { disable, enable, enabled, namespaces }
