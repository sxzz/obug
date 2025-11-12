import { coerce, matchesTemplate } from './utils.ts'
import type { Debugger, DebugOptions } from './types.ts'

let globalNamespaces: string = ''

export function namespaces(): string {
  return globalNamespaces
}

export function createDebug(
  namespace: string,
  options: Required<DebugOptions>,
): Debugger {
  let prevTime: number | undefined
  let enableOverride: boolean | undefined
  let namespacesCache: string | undefined
  let enabledCache: boolean | undefined

  const debug: Debugger = (...args: any[]) => {
    if (!debug.enabled) {
      return
    }

    const curr = Date.now()
    const ms = curr - (prevTime || curr)
    const diff = ms
    prevTime = curr

    args[0] = coerce(args[0])
    if (typeof args[0] !== 'string') {
      // Anything else let's inspect with %O
      args.unshift('%O')
    }

    // Apply any `formatters` transformations
    let index = 0
    args[0] = (args[0] as string).replace(/%([a-z%])/gi, (match, format) => {
      // If we encounter an escaped % then don't increase the array index
      if (match === '%%') return '%'

      index++
      const formatter = options.formatters[format]
      if (typeof formatter === 'function') {
        const value = args[index]
        match = formatter.call(debug, value)

        // Now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1)
        index--
      }
      return match
    })

    // Apply env-specific formatting (colors, etc.)
    options.formatArgs.call(debug, diff, args as [string, ...any[]])

    debug.log(...args)
  }
  debug.extend = function (this: Debugger, namespace: string, delimiter = ':') {
    return createDebug(this.namespace + delimiter + namespace, {
      useColors: this.useColors,
      color: this.color,
      formatArgs: this.formatArgs,
      formatters: this.formatters,
      inspectOpts: this.inspectOpts,
      log: this.log,
    })
  }
  Object.assign(debug, options)

  debug.namespace = namespace
  Object.defineProperty(debug, 'enabled', {
    enumerable: true,
    configurable: false,
    get: () => {
      if (enableOverride != null) {
        return enableOverride
      }
      if (namespacesCache !== globalNamespaces) {
        namespacesCache = globalNamespaces
        enabledCache = enabled(namespace)
      }

      return enabledCache
    },
    set: (v) => {
      enableOverride = v
    },
  })

  // Never run the code below, this is just to make TypeScript happy
  // eslint-disable-next-line no-constant-condition
  if (false) {
    debug.useColors = true
    debug.color = 0
    debug.formatArgs = () => {}
    debug.formatters = {}
    debug.inspectOpts = {}
    debug.log = () => {}
    debug.enabled = false
  }

  return debug
}

let names: string[] = []
let skips: string[] = []

export function enable(namespaces: string): void {
  globalNamespaces = namespaces

  names = []
  skips = []

  const split = globalNamespaces
    .trim()
    .replace(/\s+/g, ',')
    .split(',')
    .filter(Boolean)

  for (const ns of split) {
    if (ns[0] === '-') {
      skips.push(ns.slice(1))
    } else {
      names.push(ns)
    }
  }
}

export function disable(): string {
  const namespaces = [
    ...names,
    ...skips.map((namespace) => `-${namespace}`),
  ].join(',')
  enable('')
  return namespaces
}

export function enabled(name: string): boolean {
  for (const skip of skips) {
    if (matchesTemplate(name, skip)) {
      return false
    }
  }

  for (const ns of names) {
    if (matchesTemplate(name, ns)) {
      return true
    }
  }

  return false
}
