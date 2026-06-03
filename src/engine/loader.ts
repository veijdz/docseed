import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LoadedTemplate, LoaderOptions } from './types'

export function loadTemplate(ref: string, opts: LoaderOptions): LoadedTemplate {
  const relative = `${ref}.hbs`
  const overridePath = resolve(opts.cwd, '.docseed', 'templates', relative)
  const bundledPath = resolve(opts.bundledRoot, relative)

  if (existsSync(overridePath)) {
    return {
      ref,
      path: overridePath,
      source: 'override',
      content: readFileSync(overridePath, 'utf8'),
    }
  }

  if (existsSync(bundledPath)) {
    return {
      ref,
      path: bundledPath,
      source: 'bundled',
      content: readFileSync(bundledPath, 'utf8'),
    }
  }

  throw new Error(
    `Template '${ref}' not found. Tried override '${overridePath}' and bundled '${bundledPath}'.`,
  )
}
