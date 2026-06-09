import { readFileSync } from 'node:fs'
import { Command } from 'commander'
import { registerAddCommand } from './commands/add'
import { registerInitCommand } from './commands/init'
import { listPresets } from './presets/loader'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string
  description: string
}

function registerPresetsCommand(program: Command): void {
  program
    .command('presets')
    .description('Lista os presets de documentação disponíveis.')
    .action(() => {
      for (const preset of listPresets()) {
        console.log(`${preset.id}\t${preset.label}`)
      }
    })
}

export function buildProgram(): Command {
  const program = new Command()
  program.name('docseed').description(pkg.description).version(pkg.version)
  registerInitCommand(program)
  registerAddCommand(program)
  registerPresetsCommand(program)
  return program
}
