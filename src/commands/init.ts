import { cancel, log, note, outro } from '@clack/prompts'
import { type Command, Option } from 'commander'
import { generate } from '../engine'
import type { ConflictStrategy, GenerateSummary } from '../engine/types'
import { getPreset, listPresets } from '../presets/loader'
import { CancelledError, collectVars } from '../wizard'

export interface InitOptions {
  preset?: string
  yes?: boolean
  force?: boolean
  merge?: boolean
  dryRun?: boolean
  name?: string
  author?: string
  description?: string
  type?: string
  openSource?: boolean
  license?: string
}

/** Orchestrates the init command: resolve vars, then run the engine. */
export async function runInit(
  options: InitOptions,
  cwd: string,
  bundledRoot?: string,
): Promise<GenerateSummary> {
  const strategy: ConflictStrategy = options.force ? 'force' : options.merge ? 'merge' : 'strict'
  const vars = await collectVars(
    {
      name: options.name,
      author: options.author,
      preset: options.preset,
      description: options.description,
      type: options.type,
      openSource: options.openSource,
      license: options.license,
    },
    { yes: Boolean(options.yes), cwd },
  )
  return generate(getPreset(vars.preset), vars, {
    strategy,
    dryRun: Boolean(options.dryRun),
    cwd,
    bundledRoot,
  })
}

function reportSummary(summary: GenerateSummary): void {
  const heading = summary.dryRun ? 'Seriam gerados (dry-run)' : 'Gerados'
  if (summary.created.length > 0) {
    note(summary.created.join('\n'), heading)
  }
  if (summary.skipped.length > 0) {
    log.info(`Pulados (já existem): ${summary.skipped.join(', ')}`)
  }
  outro(summary.dryRun ? 'Nada escrito (dry-run).' : 'Concluído.')
}

export function registerInitCommand(program: Command): void {
  const presetIds = listPresets()
    .map((p) => p.id)
    .join(' | ')
  program
    .command('init')
    .description('Gera a estrutura inicial de documentação no diretório atual.')
    .option('--preset <name>', `preset de documentação (${presetIds})`)
    .option('--yes', 'modo não-interativo, usa defaults sem perguntar')
    .addOption(new Option('--force', 'sobrescreve docs/ existente').conflicts('merge'))
    .addOption(new Option('--merge', 'mescla com docs/ existente').conflicts('force'))
    .option('--dry-run', 'mostra o que seria gerado sem escrever')
    .option('--name <name>', 'nome do projeto')
    .option('--author <author>', 'autor do projeto')
    .option('--description <text>', 'descrição curta do projeto')
    .addOption(
      new Option('--type <type>', 'tipo de projeto').choices([
        'web',
        'cli',
        'library',
        'mobile',
        'other',
      ]),
    )
    .option('--open-source', 'marca o projeto como open source')
    .option('--license <id>', 'licença (MIT | Apache-2.0 | GPL-3.0)')
    .action(async (options: InitOptions) => {
      try {
        const summary = await runInit(options, process.cwd())
        reportSummary(summary)
      } catch (err) {
        if (err instanceof CancelledError) {
          cancel(err.message)
          process.exitCode = 1
          return
        }
        log.error((err as Error).message)
        process.exitCode = 1
      }
    })
}
