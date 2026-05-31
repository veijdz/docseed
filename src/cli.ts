import { readFileSync } from "node:fs"
import { Command } from "commander"

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  version: string
  description: string
}

export function buildProgram(): Command {
  const program = new Command()
  program.name("docseed").description(pkg.description).version(pkg.version)
  return program
}
