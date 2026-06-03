import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { runInit } from '../src/commands/init'
import { toKebabCase } from '../src/utils/env'
import { collectVars } from '../src/wizard'

const tmp = () => mkdtempSync(join(tmpdir(), 'docseed-'))
const templatesRoot = fileURLToPath(new URL('../templates', import.meta.url))

describe('toKebabCase', () => {
  it('normalizes spaces, camelCase and symbols', () => {
    expect(toKebabCase('My App')).toBe('my-app')
    expect(toKebabCase('myCoolProject')).toBe('my-cool-project')
    expect(toKebabCase('  weird__name!! ')).toBe('weird-name')
  })
})

describe('collectVars (non-interactive)', () => {
  it('applies flags over defaults and kebab-cases the name', async () => {
    const vars = await collectVars(
      { name: 'My App', author: 'Jane', preset: 'minimal' },
      { yes: true, cwd: '/nowhere' },
    )
    expect(vars).toMatchObject({
      projectName: 'my-app',
      author: 'Jane',
      preset: 'minimal',
      shortDescription: '',
      isOpenSource: false,
      projectType: 'other',
    })
    expect(vars.license).toBeUndefined()
  })

  it('defaults preset to mvp and name to the directory basename', async () => {
    const vars = await collectVars({ author: 'Jane' }, { yes: true, cwd: '/tmp/Cool Dir' })
    expect(vars.preset).toBe('mvp')
    expect(vars.projectName).toBe('cool-dir')
  })

  it('rejects an unknown preset', async () => {
    await expect(
      collectVars({ name: 'x', preset: 'bogus' }, { yes: true, cwd: '/nowhere' }),
    ).rejects.toThrow(/Unknown preset/)
  })
})

describe('runInit (end-to-end)', () => {
  const flags = { yes: true, name: 'Acme App', author: 'Jane', preset: 'mvp' }

  it('writes the 6 mvp docs with rendered, kebab-cased content', async () => {
    const cwd = tmp()
    const summary = await runInit(flags, cwd, templatesRoot)
    expect(summary.created).toHaveLength(6)
    expect(existsSync(join(cwd, 'docs', 'ARCHITECTURE.md'))).toBe(true)
    expect(readFileSync(join(cwd, 'docs', 'README.md'), 'utf8')).toContain('# acme-app')
  })

  it('dry-run lists docs but writes nothing', async () => {
    const cwd = tmp()
    const summary = await runInit({ ...flags, dryRun: true }, cwd, templatesRoot)
    expect(summary.created).toHaveLength(6)
    expect(existsSync(join(cwd, 'docs'))).toBe(false)
  })

  it('strict aborts when docs already exist', async () => {
    const cwd = tmp()
    await runInit(flags, cwd, templatesRoot)
    await expect(runInit(flags, cwd, templatesRoot)).rejects.toThrow(/Conflict/)
  })

  it('force overwrites and merge skips existing docs', async () => {
    const cwd = tmp()
    await runInit(flags, cwd, templatesRoot)
    const forced = await runInit({ ...flags, force: true }, cwd, templatesRoot)
    expect(forced.created).toHaveLength(6)
    const merged = await runInit({ ...flags, merge: true }, cwd, templatesRoot)
    expect(merged.created).toHaveLength(0)
    expect(merged.skipped).toHaveLength(6)
  })
})
