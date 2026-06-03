import { log, note, outro } from '@clack/prompts'
import { type Command, Option } from 'commander'
import { generate } from '../engine'
import type { ConflictStrategy, GenerateSummary } from '../engine/types'
import { getPreset } from '../presets/loader'
import { collectVars } from '../wizard'

export interface InitOptions {
  preset?: string
  yes?: boolean
  force?: boolean
  merge?: boolean
  dryRun?: boolean
  name?: string
  author?: string
}

/** Orchestrates the init command: resolve vars, then run the engine. */
export async function runInit(
  options: InitOptions,
  cwd: string,
  bundledRoot?: string,
): Promise<GenerateSummary> {
  const strategy: ConflictStrategy = options.force ? 'force' : options.merge ? 'merge' : 'strict'
  const vars = await collectVars(
    { name: options.name, author: options.author, preset: options.preset },
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
  const heading = summary.dryRun ? 'Seriam gerados (dry-run)' : 'Gerados em docs/'
  if (summary.created.length > 0) {
    note(summary.created.join('\n'), heading)
  }
  if (summary.skipped.length > 0) {
    log.info(`Pulados (já existem): ${summary.skipped.join(', ')}`)
  }
  outro(summary.dryRun ? 'Nada escrito (dry-run).' : 'Concluído.')
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Gera a estrutura inicial de documentação no diretório atual.')
    .option('--preset <name>', 'preset de documentação (minimal | mvp)')
    .option('--yes', 'modo não-interativo, usa defaults sem perguntar')
    .addOption(new Option('--force', 'sobrescreve docs/ existente').conflicts('merge'))
    .addOption(new Option('--merge', 'mescla com docs/ existente').conflicts('force'))
    .option('--dry-run', 'mostra o que seria gerado sem escrever')
    .option('--name <name>', 'nome do projeto')
    .option('--author <author>', 'autor do projeto')
    .action(async (options: InitOptions) => {
      try {
        const summary = await runInit(options, process.cwd())
        reportSummary(summary)
      } catch (err) {
        log.error((err as Error).message)
        process.exitCode = 1
      }
    })
}
