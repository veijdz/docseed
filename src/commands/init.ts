import { type Command, Option } from "commander"

interface InitOptions {
  preset?: string
  yes?: boolean
  force?: boolean
  merge?: boolean
  dryRun?: boolean
  name?: string
  author?: string
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Gera a estrutura inicial de documentação no diretório atual.")
    .option("--preset <name>", "preset de documentação (minimal | mvp)")
    .option("--yes", "modo não-interativo, usa defaults sem perguntar")
    .addOption(new Option("--force", "sobrescreve docs/ existente").conflicts("merge"))
    .addOption(new Option("--merge", "mescla com docs/ existente").conflicts("force"))
    .option("--dry-run", "mostra o que seria gerado sem escrever")
    .option("--name <name>", "nome do projeto")
    .option("--author <author>", "autor do projeto")
    .action((options: InitOptions) => {
      // Stub: wizard (#12) e engine (#17) ainda nao implementados.
      // Por ora apenas ecoa as opcoes parseadas.
      console.log(JSON.stringify(options, null, 2))
    })
}
