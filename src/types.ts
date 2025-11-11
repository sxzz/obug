import type { InspectOptions as NodeInspectOptions } from 'node:util'

export interface InspectOptions extends NodeInspectOptions {
  hideDate?: boolean
}

export interface Debugger {
  (formatter: any, ...args: any[]): void

  useColors: boolean
  color: string | number
  enabled: boolean
  namespace: string
  inspectOpts?: InspectOptions

  log: (...args: any[]) => any
  extend: (namespace: string, delimiter?: string) => Debugger

  /** @private */
  diff?: number
  /** @private */
  prev?: number
  /** @private */
  curr?: number
}

export interface Formatters {
  [formatter: string]: (this: Debugger, v: any) => string
}

export interface Debug {
  (namespace: string): Debugger

  namespaces: string

  /**
   * Disable debug output.
   */
  disable: () => string
  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   */
  enable: (namespaces: string) => void
  /**
   * Returns true if the given mode name is enabled, false otherwise.
   */
  enabled: (namespaces: string) => boolean

  formatArgs: (this: Debugger, args: [string, ...any[]]) => void
  log: (...args: any[]) => void
  selectColor: (namespace: string) => string | number
  // humanize: typeof import('ms')

  names: string[]
  skips: string[]

  formatters: Formatters
  inspectOpts?: InspectOptions
}
