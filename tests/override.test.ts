import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { generate } from '../src/engine'
import type { InputVars } from '../src/engine/types'
import { getPreset } from '../src/presets/loader'

const bundledRoot = fileURLToPath(new URL('../templates', import.meta.url))

const tmp = () => mkdtempSync(join(tmpdir(), 'docseed-override-'))

const vars: InputVars = {
  projectName: 'acme',
  author: 'Jane',
  shortDescription: 'desc',
  preset: 'minimal',
  isOpenSource: false,
  projectType: 'other',
}

describe('generate with a template override', () => {
  it('uses .docseed/templates over the bundled template end-to-end', () => {
    const cwd = tmp()
    const overrideDir = join(cwd, '.docseed', 'templates', 'shared')
    mkdirSync(overrideDir, { recursive: true })
    writeFileSync(join(overrideDir, 'README.md.hbs'), '# OVERRIDE {{projectName}}\n')

    generate(getPreset('minimal'), vars, { strategy: 'strict', dryRun: false, cwd, bundledRoot })

    const readme = readFileSync(join(cwd, 'docs', 'README.md'), 'utf8')
    expect(readme).toBe('# OVERRIDE acme\n')
    // sanity: a non-overridden doc still comes from the bundled template
    const goals = readFileSync(join(cwd, 'docs', 'GOALS.md'), 'utf8')
    expect(goals).not.toContain('OVERRIDE')
  })

  it('uses the bundled template when no override is present', () => {
    const cwd = tmp()

    generate(getPreset('minimal'), vars, { strategy: 'strict', dryRun: false, cwd, bundledRoot })

    const readme = readFileSync(join(cwd, 'docs', 'README.md'), 'utf8')
    expect(readme).not.toContain('OVERRIDE')
    expect(readme).toContain('# acme')
  })
})
