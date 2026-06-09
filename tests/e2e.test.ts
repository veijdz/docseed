import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getPreset } from '../src/presets/loader'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const binary = join(repoRoot, 'dist', 'index.mjs')

const initMvp = (cwd: string, extra = '') =>
  execSync(
    `node ${binary} init --preset mvp --yes --name test --author x --description y ${extra}`.trim(),
    { cwd, stdio: 'ignore' },
  )

describe('docseed init (real binary)', () => {
  it('writes the mvp docs with no orphan mustaches', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-'))
    initMvp(tmpDir)

    const expected = getPreset('mvp').docs.map((d) => d.path)
    expect(expected).toHaveLength(6)

    for (const p of expected) {
      const file = join(tmpDir, 'docs', p)
      expect(existsSync(file)).toBe(true)
      expect(readFileSync(file, 'utf8')).not.toContain('{{')
    }
  }, 60000)

  it('writes the minimal preset docs with no orphan mustaches', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-minimal-'))
    execSync(`node ${binary} init --preset minimal --yes --name test --author x`, {
      cwd: tmpDir,
      stdio: 'ignore',
    })

    const expected = getPreset('minimal').docs.map((d) => d.path)
    expect(expected).toHaveLength(3)

    for (const p of expected) {
      const file = join(tmpDir, 'docs', p)
      expect(existsSync(file)).toBe(true)
      expect(readFileSync(file, 'utf8')).not.toContain('{{')
    }
  }, 60000)

  it('writes a LICENSE at the project root when open source with --license', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-license-'))
    initMvp(tmpDir, '--open-source --license MIT')

    const license = join(tmpDir, 'LICENSE')
    expect(existsSync(license)).toBe(true)

    const contents = readFileSync(license, 'utf8')
    expect(contents).toContain('Copyright (c) ')
    expect(contents).toContain(String(new Date().getFullYear()))
  }, 60000)
})

describe('docseed init conflict strategies (real binary)', () => {
  it('strict aborts with a non-zero exit and leaves existing docs untouched', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-strict-'))
    initMvp(tmpDir)
    const readme = join(tmpDir, 'docs', 'README.md')
    const original = readFileSync(readme, 'utf8')

    // a second strict run must fail (non-zero exit) without overwriting
    expect(() => initMvp(tmpDir)).toThrow()
    expect(readFileSync(readme, 'utf8')).toBe(original)
  }, 60000)

  it('--force overwrites existing docs', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-force-'))
    initMvp(tmpDir)
    const readme = join(tmpDir, 'docs', 'README.md')
    writeFileSync(readme, 'SENTINEL\n')

    initMvp(tmpDir, '--force')

    const after = readFileSync(readme, 'utf8')
    expect(after).not.toContain('SENTINEL')
    expect(after).toContain('# test')
  }, 60000)

  it('--merge skips existing docs', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-merge-'))
    initMvp(tmpDir)
    const readme = join(tmpDir, 'docs', 'README.md')
    writeFileSync(readme, 'SENTINEL\n')

    initMvp(tmpDir, '--merge')

    // merge leaves the pre-existing file in place
    expect(readFileSync(readme, 'utf8')).toBe('SENTINEL\n')
  }, 60000)
})
