import { coerce, matchesTemplate, selectColor } from './utils.ts'
import type { Debug, Debugger } from './types.ts'

export function setup(
  useColors: boolean,
  colors: (string | number)[],
  log: Debug['log'],
  load: () => string,
  save: (namespaces: string) => void,
  formatArgs: Debug['formatArgs'],
  init?: (debug: Debugger) => void,
): Debug {
  const createDebug: Debug = (namespace: string): Debugger => {
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
      debug.diff = ms
      debug.prev = prevTime
      debug.curr = curr
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
        const formatter = createDebug.formatters[format]
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
      createDebug.formatArgs.call(debug, args as [string, ...any[]])

      const logFn = debug.log || createDebug.log
      logFn.apply(debug, args)
    }

    function extend(this: Debugger, namespace: string, delimiter = ':') {
      const newDebug = createDebug(this.namespace + delimiter + namespace)
      newDebug.log = this.log
      return newDebug
    }

    debug.namespace = namespace
    debug.useColors = useColors
    debug.color = selectColor(colors, namespace)
    debug.extend = extend
    debug.log = log

    // Never run the code below, this is just to make TypeScript happy
    // eslint-disable-next-line no-constant-condition
    if (false) {
      debug.enabled = false
    }
    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride != null) {
          return enableOverride
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces
          enabledCache = createDebug.enabled(namespace)
        }

        return enabledCache
      },
      set: (v) => {
        enableOverride = v
      },
    })

    // Env-specific initialization logic for debug instances
    init && init(debug)

    return debug
  }

  function enable(namespaces: string) {
    save(namespaces)
    createDebug.namespaces = namespaces

    createDebug.names = []
    createDebug.skips = []

    const split = namespaces
      .trim()
      .replace(/\s+/g, ',')
      .split(',')
      .filter(Boolean)

    for (const ns of split) {
      if (ns[0] === '-') {
        createDebug.skips.push(ns.slice(1))
      } else {
        createDebug.names.push(ns)
      }
    }
  }

  function disable() {
    const namespaces = [
      ...createDebug.names,
      ...createDebug.skips.map((namespace) => `-${namespace}`),
    ].join(',')
    createDebug.enable('')
    return namespaces
  }

  function enabled(name: string): boolean {
    for (const skip of createDebug.skips) {
      if (matchesTemplate(name, skip)) {
        return false
      }
    }

    for (const ns of createDebug.names) {
      if (matchesTemplate(name, ns)) {
        return true
      }
    }

    return false
  }

  createDebug.namespaces = ''
  createDebug.names = []
  createDebug.skips = []
  createDebug.enable = enable
  createDebug.disable = disable
  createDebug.enabled = enabled
  createDebug.selectColor = (ns) => selectColor(colors, ns)
  createDebug.formatArgs = formatArgs
  createDebug.log = log
  createDebug.formatters = {}

  createDebug.enable(load())

  return createDebug
}
