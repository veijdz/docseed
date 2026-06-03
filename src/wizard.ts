import { basename } from 'node:path'
import { cancel, confirm, intro, isCancel, select, text } from '@clack/prompts'
import type { InputVars, ProjectType } from './engine/types'
import { getPreset, listPresets } from './presets/loader'
import { gitUserName, toKebabCase } from './utils/env'

/** Flags that can pre-fill template variables, bypassing the matching prompt. */
export interface VarFlags {
  name?: string
  author?: string
  preset?: string
}

export interface CollectContext {
  /** Non-interactive mode: skip prompts and use flags + defaults. */
  yes: boolean
  cwd: string
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'cli', label: 'CLI' },
  { value: 'library', label: 'Biblioteca' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Outro' },
]

const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'proprietary']

/** Exit cleanly (no stack trace) when the user cancels a prompt. */
function unwrap<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Operação cancelada.')
    process.exit(0)
  }
  return value
}

function requireProjectName(raw: string): string {
  const name = toKebabCase(raw)
  if (!name) {
    throw new Error('projectName is required and must contain alphanumeric characters')
  }
  return name
}

/** Single resolution point: precedence is flag > wizard answer > default. */
export async function collectVars(flags: VarFlags, ctx: CollectContext): Promise<InputVars> {
  return ctx.yes ? resolveNonInteractive(flags, ctx.cwd) : runWizard(flags, ctx.cwd)
}

function resolveNonInteractive(flags: VarFlags, cwd: string): InputVars {
  const projectName = requireProjectName(flags.name ?? basename(cwd))
  const preset = flags.preset ?? 'mvp'
  getPreset(preset)
  return {
    projectName,
    author: flags.author ?? gitUserName() ?? '',
    shortDescription: '',
    preset,
    isOpenSource: false,
    projectType: 'other',
  }
}

async function runWizard(flags: VarFlags, cwd: string): Promise<InputVars> {
  intro('docseed')

  const projectName = requireProjectName(
    flags.name ??
      unwrap(
        await text({
          message: 'Nome do projeto',
          defaultValue: basename(cwd),
          placeholder: basename(cwd),
          validate: (value) => (value?.trim() ? undefined : 'Obrigatório'),
        }),
      ),
  )

  const author =
    flags.author ??
    unwrap(
      await text({
        message: 'Autor',
        defaultValue: gitUserName() ?? '',
        placeholder: gitUserName() ?? '',
      }),
    )

  const shortDescription = unwrap(
    await text({ message: 'Descrição curta', placeholder: '', defaultValue: '' }),
  )

  const preset =
    flags.preset ??
    unwrap(
      await select({
        message: 'Preset',
        options: listPresets().map((p) => ({ value: p.id, label: p.label })),
      }),
    )
  getPreset(preset)

  const isOpenSource = unwrap(
    await confirm({ message: 'Projeto open source?', initialValue: false }),
  )

  const projectType = unwrap(
    await select({ message: 'Tipo de projeto', options: PROJECT_TYPES }),
  ) as ProjectType

  const vars: InputVars = {
    projectName,
    author,
    shortDescription,
    preset,
    isOpenSource,
    projectType,
  }

  if (isOpenSource) {
    vars.license = unwrap(
      await select({
        message: 'Licença',
        options: LICENSES.map((value) => ({ value, label: value })),
      }),
    )
  }

  return vars
}
