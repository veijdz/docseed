import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildProgram } from '../src/cli'
import { listPresets } from '../src/presets/loader'

const CANCEL = Symbol('cancel')

vi.mock('@clack/prompts', () => ({
  intro: () => {},
  cancel: () => {},
  note: () => {},
  outro: () => {},
  log: { info: () => {}, error: () => {} },
  isCancel: (value: unknown) => value === CANCEL,
  text: async () => CANCEL,
  select: async () => CANCEL,
  confirm: async () => CANCEL,
}))

describe('docseed CLI', () => {
  it('registra o comando init com todas as flags', () => {
    const program = buildProgram()
    const init = program.commands.find((c) => c.name() === 'init')
    if (!init) throw new Error('init command not registered')
    const flags = init.options.map((o) => o.long)
    expect(flags).toEqual(
      expect.arrayContaining([
        '--preset',
        '--yes',
        '--force',
        '--merge',
        '--dry-run',
        '--name',
        '--author',
        '--description',
        '--type',
        '--open-source',
        '--license',
      ]),
    )
  })

  it('rejeita --force e --merge juntos', () => {
    const program = buildProgram()
    program.exitOverride()
    const init = program.commands.find((c) => c.name() === 'init')
    if (!init) throw new Error('init command not registered')
    init.exitOverride()
    init.configureOutput({ writeErr: () => {} })
    expect(() => program.parse(['init', '--force', '--merge'], { from: 'user' })).toThrow()
  })
})

describe('docseed presets command', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('registra o comando presets', () => {
    const program = buildProgram()
    expect(program.commands.some((c) => c.name() === 'presets')).toBe(true)
  })

  it('imprime cada preset com id e label', async () => {
    const program = buildProgram()
    await program.parseAsync(['presets'], { from: 'user' })
    const output = logSpy.mock.calls.map((call: unknown[]) => String(call[0])).join('\n')
    for (const preset of listPresets()) {
      expect(output).toContain(preset.id)
      expect(output).toContain(preset.label)
    }
  })
})

describe('docseed init cancellation', () => {
  const realExitCode = process.exitCode

  afterEach(() => {
    process.exitCode = realExitCode
  })

  it('exits non-zero when the wizard is cancelled', async () => {
    const program = buildProgram()
    await program.parseAsync(['init'], { from: 'user' })
    expect(process.exitCode).toBe(1)
  })
})

describe('docseed add adr failure', () => {
  const realExitCode = process.exitCode

  afterEach(() => {
    process.exitCode = realExitCode
  })

  it('exits non-zero when the title produces an empty slug', async () => {
    const program = buildProgram()
    await program.parseAsync(['add', 'adr', '!!!'], { from: 'user' })
    expect(process.exitCode).toBe(1)
  })
})
