import type { InspectOptions as NodeInspectOptions } from 'node:util'

export interface InspectOptions extends NodeInspectOptions {
  hideDate?: boolean
}

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
