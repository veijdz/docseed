import { log, outro } from '@clack/prompts'
import type { Command } from 'commander'
import { type AddAdrResult, addAdr } from '../adr'

/** Orchestrates `add adr`: generate the next ADR and update the index. */
export function runAddAdr(title: string, cwd: string, bundledRoot?: string): AddAdrResult {
  return addAdr(title, { cwd, bundledRoot })
}

export function registerAddCommand(program: Command): void {
  const add = program
    .command('add')
    .description('Adiciona artefatos de documentação a um projeto existente.')

  add
    .command('adr')
    .description('Cria o próximo ADR sequencial em docs/adr/ e atualiza o índice.')
    .argument('<title>', 'título da decisão')
    .action((title: string) => {
      try {
        const result = runAddAdr(title, process.cwd())
        const suffix = result.indexCreated ? ' (índice criado)' : ''
        outro(`Criado ${result.path}${suffix}. Índice atualizado.`)
      } catch (err) {
        log.error((err as Error).message)
        process.exitCode = 1
      }
    })
}
