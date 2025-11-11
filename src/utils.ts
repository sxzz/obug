/**
 * Coerce `value`.
 */
export function coerce(value: any): any {
  if (value instanceof Error) {
    return value.stack || value.message
  }
  return value
}

/**
 * Selects a color for a debug namespace
 * @return An ANSI color code for the given namespace
 */
export function selectColor(
  colors: (string | number)[],
  namespace: string,
): string | number {
  let hash = 0

  for (let i = 0; i < namespace.length; i++) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = (hash << 5) - hash + namespace.charCodeAt(i)
    // eslint-disable-next-line unicorn/prefer-math-trunc
    hash |= 0 // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Checks if the given string matches a namespace template, honoring
 * asterisks as wildcards.
 */
export function matchesTemplate(search: string, template: string): boolean {
  let searchIndex = 0
  let templateIndex = 0
  let starIndex = -1
  let matchIndex = 0

  while (searchIndex < search.length) {
    if (
      templateIndex < template.length &&
      (template[templateIndex] === search[searchIndex] ||
        template[templateIndex] === '*')
    ) {
      // Match character or proceed with wildcard
      if (template[templateIndex] === '*') {
        starIndex = templateIndex
        matchIndex = searchIndex
        templateIndex++ // Skip the '*'
      } else {
        searchIndex++
        templateIndex++
      }
      // eslint-disable-next-line unicorn/no-negated-condition
    } else if (starIndex !== -1) {
      // Backtrack to the last '*' and try to match more characters
      templateIndex = starIndex + 1
      matchIndex++
      searchIndex = matchIndex
    } else {
      return false // No match
    }
  }

  // Handle trailing '*' in template
  while (templateIndex < template.length && template[templateIndex] === '*') {
    templateIndex++
  }

  return templateIndex === template.length
}

export function humanize(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
  return `${value}ms`
}
