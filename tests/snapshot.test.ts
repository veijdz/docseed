import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { generate } from '../src/engine'
import type { InputVars } from '../src/engine/types'
import { getPreset } from '../src/presets/loader'

const bundledRoot = fileURLToPath(new URL('../templates', import.meta.url))

const baseVars: Omit<InputVars, 'preset'> = {
  projectName: 'acme-app',
  author: 'Jane Doe',
  shortDescription: 'A sample project',
  isOpenSource: true,
  projectType: 'cli',
  license: 'MIT',
}

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
})

afterAll(() => {
  vi.useRealTimers()
})

describe('preset snapshots', () => {
  for (const id of ['minimal', 'mvp'] as const) {
    it(`renders the ${id} preset deterministically`, () => {
      const cwd = mkdtempSync(join(tmpdir(), 'docseed-snap-'))
      const vars: InputVars = { ...baseVars, preset: id }
      const summary = generate(getPreset(id), vars, {
        strategy: 'force',
        dryRun: false,
        cwd,
        bundledRoot,
      })

      const filesByPath: Record<string, string> = {}
      for (const p of [...summary.created].sort()) {
        filesByPath[p] = readFileSync(join(cwd, 'docs', p), 'utf8')
      }

      expect(filesByPath).toMatchSnapshot()
    })
  }
})
