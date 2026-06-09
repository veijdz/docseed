import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { generate } from '../src/engine'
import type { InputVars } from '../src/engine/types'
import { renderLicense } from '../src/license'
import { getPreset } from '../src/presets/loader'

const bundledRoot = fileURLToPath(new URL('../templates', import.meta.url))

const baseVars: InputVars = {
  projectName: 'acme-app',
  author: 'Jane Doe',
  shortDescription: 'A sample project',
  preset: 'minimal',
  isOpenSource: true,
  projectType: 'cli',
  license: 'MIT',
}

const tmp = () => mkdtempSync(join(tmpdir(), 'docseed-license-'))

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
})

afterAll(() => {
  vi.useRealTimers()
})

describe('renderLicense', () => {
  it('substitutes year and author into the MIT text', () => {
    const text = renderLicense('MIT', { author: 'Jane Doe', year: '2026' })
    expect(text).not.toBeNull()
    expect(text).toContain('MIT License')
    expect(text).toContain('Copyright (c) 2026 Jane Doe')
    expect(text).not.toContain('<year>')
    expect(text).not.toContain('<copyright holders>')
  })

  it('returns the canonical Apache-2.0 text as-is', () => {
    const text = renderLicense('Apache-2.0', { author: 'Jane Doe', year: '2026' })
    expect(text).not.toBeNull()
    expect(text).toContain('Apache License')
    expect(text).toContain('Version 2.0')
  })

  it('maps GPL-3.0 to GPL-3.0-or-later and returns it as-is', () => {
    const text = renderLicense('GPL-3.0', { author: 'Jane Doe', year: '2026' })
    expect(text).not.toBeNull()
    expect(text).toContain('GNU GENERAL PUBLIC LICENSE')
    expect(text).toContain('Version 3')
  })

  it('returns null for an unsupported license', () => {
    expect(renderLicense('proprietary', { author: 'Jane Doe', year: '2026' })).toBeNull()
    expect(renderLicense('BSD-2-Clause', { author: 'Jane Doe', year: '2026' })).toBeNull()
  })
})

describe('generate (LICENSE at project root)', () => {
  it('writes LICENSE at root with substituted author/year for an open-source license', () => {
    const cwd = tmp()
    const summary = generate(getPreset('minimal'), baseVars, {
      strategy: 'force',
      dryRun: false,
      cwd,
      bundledRoot,
    })

    expect(summary.created).toContain('LICENSE')
    const licensePath = join(cwd, 'LICENSE')
    expect(existsSync(licensePath)).toBe(true)
    expect(existsSync(join(cwd, 'docs', 'LICENSE'))).toBe(false)

    const text = readFileSync(licensePath, 'utf8')
    expect(text).toContain('Copyright (c) 2026 Jane Doe')
  })

  it('does not write LICENSE when isOpenSource is false', () => {
    const cwd = tmp()
    const vars: InputVars = { ...baseVars, isOpenSource: false, license: undefined }
    const summary = generate(getPreset('minimal'), vars, {
      strategy: 'force',
      dryRun: false,
      cwd,
      bundledRoot,
    })

    expect(summary.created).not.toContain('LICENSE')
    expect(existsSync(join(cwd, 'LICENSE'))).toBe(false)
  })

  it('does not write LICENSE for an unsupported license value', () => {
    const cwd = tmp()
    const vars: InputVars = { ...baseVars, license: 'proprietary' }
    const summary = generate(getPreset('minimal'), vars, {
      strategy: 'force',
      dryRun: false,
      cwd,
      bundledRoot,
    })

    expect(summary.created).not.toContain('LICENSE')
    expect(existsSync(join(cwd, 'LICENSE'))).toBe(false)
  })

  it('respects dryRun: lists LICENSE but writes nothing', () => {
    const cwd = tmp()
    const summary = generate(getPreset('minimal'), baseVars, {
      strategy: 'force',
      dryRun: true,
      cwd,
      bundledRoot,
    })

    expect(summary.created).toContain('LICENSE')
    expect(existsSync(join(cwd, 'LICENSE'))).toBe(false)
  })
})
