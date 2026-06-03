import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadTemplate } from '../src/engine/loader'

const bundledRoot = fileURLToPath(new URL('../templates', import.meta.url))

function tempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

describe('loadTemplate', () => {
  it('resolves a real preset template from the bundled root', () => {
    const cwd = tempDir('docseed-cwd-')

    const loaded = loadTemplate('shared/README.md', { cwd, bundledRoot })

    expect(loaded.source).toBe('bundled')
    expect(loaded.ref).toBe('shared/README.md')
    expect(loaded.content.length).toBeGreaterThan(0)
  })

  it('prefers the override over the bundled template', () => {
    const cwd = tempDir('docseed-cwd-')
    const bundled = tempDir('docseed-bundled-')

    const overrideDir = join(cwd, '.docseed', 'templates')
    mkdirSync(overrideDir, { recursive: true })
    writeFileSync(join(overrideDir, 'foo.md.hbs'), 'OVERRIDE')
    writeFileSync(join(bundled, 'foo.md.hbs'), 'BUNDLED')

    const loaded = loadTemplate('foo.md', { cwd, bundledRoot: bundled })

    expect(loaded.source).toBe('override')
    expect(loaded.content).toBe('OVERRIDE')
  })

  it('falls back to the bundled template without an override', () => {
    const cwd = tempDir('docseed-cwd-')
    const bundled = tempDir('docseed-bundled-')

    writeFileSync(join(bundled, 'foo.md.hbs'), 'BUNDLED')

    const loaded = loadTemplate('foo.md', { cwd, bundledRoot: bundled })

    expect(loaded.source).toBe('bundled')
    expect(loaded.content).toBe('BUNDLED')
  })

  it('throws when neither override nor bundled template exists', () => {
    const cwd = tempDir('docseed-cwd-')
    const bundled = tempDir('docseed-bundled-')

    expect(() => loadTemplate('does-not-exist', { cwd, bundledRoot: bundled })).toThrow(/not found/)
  })
})
