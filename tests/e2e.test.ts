import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { getPreset } from '../src/presets/loader'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const binary = join(repoRoot, 'dist', 'index.mjs')

describe('docseed init (real binary)', () => {
  beforeAll(() => {
    execSync('pnpm -s build', { cwd: repoRoot, stdio: 'ignore' })
  }, 120000)

  it('writes the mvp docs with no orphan mustaches', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'docseed-e2e-'))
    execSync(`node ${binary} init --preset mvp --yes --name test --author x`, {
      cwd: tmpDir,
      stdio: 'ignore',
    })

    const expected = getPreset('mvp').docs.map((d) => d.path)
    expect(expected).toHaveLength(6)

    for (const p of expected) {
      const file = join(tmpDir, 'docs', p)
      expect(existsSync(file)).toBe(true)
      expect(readFileSync(file, 'utf8')).not.toContain('{{')
    }
  }, 60000)
})
