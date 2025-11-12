import { setup } from './core.ts'
import { humanize } from './utils.ts'
import type { Debug, Debugger } from './types.ts'

export const colors: string[] = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33',
]

export function useColors(): boolean {
  return true
}

/**
 * Colorize log arguments if enabled.
 */
export function formatArgs(this: Debugger, args: [string, ...any[]]): void {
  const { useColors } = this
  args[0] = `${
    (useColors ? '%c' : '') +
    this.namespace +
    (useColors ? ' %c' : ' ') +
    args[0] +
    (useColors ? '%c ' : ' ')
  }+${humanize(this.diff!)}`

  if (!useColors) {
    return
  }

  const c = `color: ${this.color}`
  args.splice(1, 0, c, 'color: inherit')

  // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  let index = 0
  let lastC = 0
  args[0].replace(/%[a-z%]/gi, (match: any): any => {
    if (match === '%%') {
      return
    }
    index++
    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index
    }
  })

  args.splice(lastC, 0, c)
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 */
export const log: Debugger['log'] = console.debug || console.log || (() => {})

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 */
function localstorage(): Storage | undefined {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage
  } catch {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
// Use non-null assertion operator because
// we handle the case where storage is undefined in load/save.
const storage = localstorage()!

/**
 * Save `namespaces`.
 */
function save(namespaces: string) {
  try {
    if (namespaces) {
      storage.setItem('debug', namespaces)
    } else {
      storage.removeItem('debug')
    }
  } catch {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

/**
 * Load `namespaces`.
 * @return returns the previously persisted debug modes
 */
function load(): string {
  let r: string | null | undefined
  try {
    r = storage.getItem('debug') || storage.getItem('DEBUG')
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

export const createDebug: Debug = setup(
  useColors(),
  colors,
  log,
  load,
  save,
  formatArgs,
)

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */
createDebug.formatters.j = function (v) {
  try {
    return JSON.stringify(v)
  } catch (error: any) {
    return `[UnexpectedJSONParseError]: ${error.message}`
  }
}

export default createDebug
export type * from './types.ts'
