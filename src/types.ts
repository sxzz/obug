import type { InspectOptions as NodeInspectOptions } from 'node:util'

export interface InspectOptions extends NodeInspectOptions {
  hideDate?: boolean
}

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */
export interface Formatters {
  [formatter: string]: (this: Debugger, v: any) => string
}

export interface Debugger extends Required<DebugOptions> {
  (formatter: any, ...args: any[]): void

  namespace: string
  enabled: boolean

  extend: (namespace: string, delimiter?: string) => Debugger
}

export interface DebugOptions {
  useColors?: boolean
  color?: string | number

  formatArgs?: (this: Debugger, diff: number, args: [string, ...any[]]) => void
  formatters?: Formatters
  /** Node.js only */
  inspectOpts?: InspectOptions

  log?: (this: Debugger, ...args: any[]) => void
}
