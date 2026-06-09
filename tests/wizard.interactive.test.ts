import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { collectVars } from '../src/wizard'

// Interactive wizard (yes:false) without a TTY: mock '@clack/prompts' so each
// prompt resolves a queued value. text/select share one queue (FIFO in wizard
// order); confirm has its own. isCancel always false here, so nothing cancels.
const textQueue: string[] = []
const selectQueue: string[] = []
const confirmQueue: boolean[] = []

vi.mock('@clack/prompts', () => ({
  intro: () => {},
  cancel: () => {},
  isCancel: () => false,
  text: async () => textQueue.shift() ?? '',
  select: async () => selectQueue.shift() ?? '',
  confirm: async () => confirmQueue.shift() ?? false,
}))

// Deterministic author fallback regardless of the host git config.
vi.mock('../src/utils/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/env')>()),
  gitUserName: () => 'Git User',
}))

beforeEach(() => {
  textQueue.length = 0
  selectQueue.length = 0
  confirmQueue.length = 0
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('runWizard (interactive, no flags)', () => {
  it('resolves vars from prompt answers and kebab-cases the name', async () => {
    // wizard prompt order: name, author, description (text), preset (select),
    // open source? (confirm) -> false, type (select)
    textQueue.push('My App', 'Jane Doe', 'Uma descrição')
    selectQueue.push('minimal', 'cli')
    confirmQueue.push(false)

    const vars = await collectVars({}, { yes: false, cwd: '/tmp/whatever' })

    expect(vars).toMatchObject({
      projectName: 'my-app',
      author: 'Jane Doe',
      shortDescription: 'Uma descrição',
      preset: 'minimal',
      isOpenSource: false,
      projectType: 'cli',
    })
    expect(vars.license).toBeUndefined()
  })

  it('asks for a license only when open source is confirmed', async () => {
    // name, author, description (text); preset, then license (select); confirm -> true
    textQueue.push('lib', 'Jane', 'desc')
    selectQueue.push('mvp', 'other', 'Apache-2.0')
    confirmQueue.push(true)

    const vars = await collectVars({}, { yes: false, cwd: '/tmp/whatever' })

    expect(vars.isOpenSource).toBe(true)
    expect(vars.license).toBe('Apache-2.0')
    expect(vars.projectType).toBe('other')
  })
})

describe('runWizard (interactive, flags pre-fill prompts)', () => {
  it('uses flag values and skips the matching prompts', async () => {
    // Only the prompts NOT covered by a flag should be consumed. Here every var
    // is supplied by a flag, so no queued answer is needed at all.
    const vars = await collectVars(
      {
        name: 'Flagged App',
        author: 'Flag Author',
        description: 'desc via flag',
        preset: 'minimal',
        openSource: true,
        type: 'library',
        license: 'MIT',
      },
      { yes: false, cwd: '/tmp/whatever' },
    )

    expect(vars).toMatchObject({
      projectName: 'flagged-app',
      author: 'Flag Author',
      shortDescription: 'desc via flag',
      preset: 'minimal',
      isOpenSource: true,
      projectType: 'library',
      license: 'MIT',
    })
    // Nothing was dequeued because every prompt was pre-filled by a flag.
    expect(textQueue).toHaveLength(0)
    expect(selectQueue).toHaveLength(0)
    expect(confirmQueue).toHaveLength(0)
  })

  it('prompts only for the fields without a flag', async () => {
    // name + preset come from flags; the wizard still asks author, description,
    // open source (confirm) and type. Queue exactly those answers.
    textQueue.push('Asked Author', 'asked desc')
    selectQueue.push('cli')
    confirmQueue.push(false)

    const vars = await collectVars(
      { name: 'Mixed', preset: 'minimal' },
      { yes: false, cwd: '/tmp/whatever' },
    )

    expect(vars.projectName).toBe('mixed')
    expect(vars.preset).toBe('minimal')
    expect(vars.author).toBe('Asked Author')
    expect(vars.shortDescription).toBe('asked desc')
    expect(vars.projectType).toBe('cli')
    // both text answers were consumed by author + description
    expect(textQueue).toHaveLength(0)
    expect(selectQueue).toHaveLength(0)
  })
})
