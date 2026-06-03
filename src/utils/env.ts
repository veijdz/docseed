import { execSync } from 'node:child_process'

/** Normalize an arbitrary project name to kebab-case (e.g. 'My App' -> 'my-app'). */
export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/** Best-effort author fallback from the local git config. Undefined if unavailable. */
export function gitUserName(): string | undefined {
  try {
    const name = execSync('git config user.name', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return name || undefined
  } catch {
    return undefined
  }
}
