import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { runInit } from '../src/commands/init'
import { toKebabCase } from '../src/utils/env'
import { CancelledError, collectVars } from '../src/wizard'

const CANCEL = Symbol('cancel')

vi.mock('@clack/prompts', () => ({
  intro: () => {},
  cancel: () => {},
  isCancel: (value: unknown) => value === CANCEL,
  text: async () => CANCEL,
  select: async () => CANCEL,
  confirm: async () => CANCEL,
}))

// Stub gitUserName so the author fallback is deterministic regardless of the
// host's git config (CI has none); keep toKebabCase real.
vi.mock('../src/utils/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/env')>()),
  gitUserName: () => 'Git User',
}))

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
    const vars = await collectVars(
      { author: 'Jane', description: 'desc' },
      { yes: true, cwd: '/tmp/Cool Dir' },
    )
    expect(vars.preset).toBe('mvp')
    expect(vars.projectName).toBe('cool-dir')
  })

  it('rejects an unknown preset', async () => {
    await expect(
      collectVars({ name: 'x', preset: 'bogus' }, { yes: true, cwd: '/nowhere' }),
    ).rejects.toThrow(/Preset desconhecido/)
  })

  it('maps --description/--type/--open-source/--license flags', async () => {
    const vars = await collectVars(
      {
        name: 'x',
        author: 'Jane',
        preset: 'mvp',
        description: 'A small tool',
        type: 'cli',
        openSource: true,
        license: 'MIT',
      },
      { yes: true, cwd: '/nowhere' },
    )
    expect(vars).toMatchObject({
      shortDescription: 'A small tool',
      projectType: 'cli',
      isOpenSource: true,
      license: 'MIT',
    })
  })

  it('ignores --license when not open source', async () => {
    const vars = await collectVars(
      { name: 'x', author: 'Jane', preset: 'minimal', license: 'MIT' },
      { yes: true, cwd: '/nowhere' },
    )
    expect(vars.isOpenSource).toBe(false)
    expect(vars.license).toBeUndefined()
  })

  it('rejects an invalid --type', async () => {
    await expect(
      collectVars(
        { name: 'x', author: 'Jane', preset: 'minimal', type: 'desktop' },
        { yes: true, cwd: '/nowhere' },
      ),
    ).rejects.toThrow(/Invalid --type/)
  })

  it('rejects an invalid --license', async () => {
    await expect(
      collectVars(
        { name: 'x', author: 'Jane', preset: 'minimal', openSource: true, license: 'BSD' },
        { yes: true, cwd: '/nowhere' },
      ),
    ).rejects.toThrow(/Licença inválida/)
  })

  it('errors when a preset requiredVar is missing', async () => {
    await expect(
      collectVars({ name: 'x', author: 'Jane', preset: 'mvp' }, { yes: true, cwd: '/nowhere' }),
    ).rejects.toThrow(/Variáveis obrigatórias ausentes para o preset 'mvp': shortDescription/)
  })

  it('falls back to basename when --name is empty/whitespace', async () => {
    const vars = await collectVars(
      { name: '   ', author: 'Jane', preset: 'minimal' },
      { yes: true, cwd: '/tmp/Cool Dir' },
    )
    expect(vars.projectName).toBe('cool-dir')
  })

  it('falls back to git user when --author is empty/whitespace', async () => {
    const vars = await collectVars(
      { name: 'x', author: '  ', preset: 'minimal' },
      { yes: true, cwd: '/nowhere' },
    )
    expect(vars.author).toBe('Git User')
  })
})

describe('collectVars (interactive cancellation)', () => {
  it('throws CancelledError when a prompt is cancelled', async () => {
    await expect(collectVars({}, { yes: false, cwd: '/nowhere' })).rejects.toBeInstanceOf(
      CancelledError,
    )
  })
})

describe('runInit (end-to-end)', () => {
  const flags = {
    yes: true,
    name: 'Acme App',
    author: 'Jane',
    preset: 'mvp',
    description: 'Uma app de exemplo',
  }

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
    await expect(runInit(flags, cwd, templatesRoot)).rejects.toThrow(/Conflito/)
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
