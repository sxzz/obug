import {
  createDebug as createBrowserDebug,
  disable,
  enable,
  enabled,
  namespaces,
} from './browser.ts'
import type { Debugger, DebugOptions } from './types.ts'

export function createDebug(
  namespace: string,
  options?: DebugOptions,
): Debugger {
  return createBrowserDebug(
    namespace,
    Object.assign({}, options, { useColors: false }),
  )
}

export type * from './types.ts'
export { disable, enable, enabled, namespaces }
