import { basename } from 'node:path'
import { confirm, intro, isCancel, select, text } from '@clack/prompts'
import type { InputVars, ProjectType } from './engine/types'
import { getPreset, listPresets } from './presets/loader'
import { gitUserName, toKebabCase } from './utils/env'

/** Flags that can pre-fill template variables, bypassing the matching prompt. */
export interface VarFlags {
  name?: string
  author?: string
  preset?: string
  description?: string
  type?: string
  openSource?: boolean
  license?: string
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

/** Thrown by `unwrap` when the user cancels a prompt; handled by the command actions. */
export class CancelledError extends Error {
  constructor() {
    super('Operação cancelada.')
    this.name = 'CancelledError'
  }
}

/** Propagate a cancellation (no process.exit here) when the user cancels a prompt. */
function unwrap<T>(value: T | symbol): T {
  if (isCancel(value)) {
    throw new CancelledError()
  }
  return value
}

function requireProjectName(raw: string): string {
  const name = toKebabCase(raw)
  if (!name) {
    throw new Error('projectName é obrigatório e deve conter caracteres alfanuméricos')
  }
  return name
}

/** Validate a project type flag against the ProjectType union. */
function resolveProjectType(value: string): ProjectType {
  const match = PROJECT_TYPES.find((t) => t.value === value)
  if (!match) {
    const valid = PROJECT_TYPES.map((t) => t.value).join(', ')
    throw new Error(`Invalid --type '${value}'. Valid values: ${valid}.`)
  }
  return match.value
}

/** Validate a license flag against the known LICENSES list. */
function resolveLicense(value: string): string {
  if (!LICENSES.includes(value)) {
    throw new Error(`Licença inválida '${value}'. Valores válidos: ${LICENSES.join(', ')}.`)
  }
  return value
}

/** Single resolution point: precedence is flag > wizard answer > default. */
export async function collectVars(flags: VarFlags, ctx: CollectContext): Promise<InputVars> {
  return ctx.yes ? resolveNonInteractive(flags, ctx.cwd) : runWizard(flags, ctx.cwd)
}

function resolveNonInteractive(flags: VarFlags, cwd: string): InputVars {
  const projectName = requireProjectName(flags.name?.trim() || basename(cwd))
  const preset = flags.preset ?? 'mvp'
  getPreset(preset)

  const vars: InputVars = {
    projectName,
    author: flags.author?.trim() || gitUserName() || '',
    shortDescription: flags.description?.trim() ?? '',
    preset,
    isOpenSource: Boolean(flags.openSource),
    projectType: flags.type ? resolveProjectType(flags.type) : 'other',
  }

  if (vars.isOpenSource && flags.license) {
    vars.license = resolveLicense(flags.license)
  }

  assertRequiredVars(preset, vars)
  return vars
}

/** Enforce the preset's requiredVars; throws listing the missing fields. */
function assertRequiredVars(preset: string, vars: InputVars): void {
  const values: Record<string, unknown> = vars
  const missing = getPreset(preset).requiredVars.filter((name) => {
    const value = values[name]
    return typeof value === 'string' ? value.trim() === '' : value == null
  })
  if (missing.length > 0) {
    throw new Error(
      `Variáveis obrigatórias ausentes para o preset '${preset}': ${missing.join(', ')}. ` +
        'Use a flag correspondente (ex.: --description, --author) ou rode em modo interativo.',
    )
  }
}

async function runWizard(flags: VarFlags, cwd: string): Promise<InputVars> {
  intro('docseed')

  const projectName = requireProjectName(
    flags.name?.trim() ||
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
    flags.author?.trim() ||
    unwrap(
      await text({
        message: 'Autor',
        defaultValue: gitUserName() ?? '',
        placeholder: gitUserName() ?? '',
      }),
    )

  const shortDescription =
    flags.description?.trim() ??
    unwrap(await text({ message: 'Descrição curta', placeholder: '', defaultValue: '' }))

  const preset =
    flags.preset ??
    unwrap(
      await select({
        message: 'Preset',
        options: listPresets().map((p) => ({ value: p.id, label: p.label })),
      }),
    )
  getPreset(preset)

  const isOpenSource =
    flags.openSource ??
    unwrap(await confirm({ message: 'Projeto open source?', initialValue: false }))

  const projectType = flags.type
    ? resolveProjectType(flags.type)
    : (unwrap(await select({ message: 'Tipo de projeto', options: PROJECT_TYPES })) as ProjectType)

  const vars: InputVars = {
    projectName,
    author,
    shortDescription,
    preset,
    isOpenSource,
    projectType,
  }

  if (isOpenSource) {
    vars.license = flags.license
      ? resolveLicense(flags.license)
      : unwrap(
          await select({
            message: 'Licença',
            options: LICENSES.map((value) => ({ value, label: value })),
          }),
        )
  }

  return vars
}
