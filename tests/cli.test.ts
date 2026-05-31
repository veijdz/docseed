import { describe, expect, it } from "vitest"
import { buildProgram } from "../src/cli"

describe("docseed CLI", () => {
  it("registra o comando init com todas as flags", () => {
    const program = buildProgram()
    const init = program.commands.find((c) => c.name() === "init")
    if (!init) throw new Error("init command not registered")
    const flags = init.options.map((o) => o.long)
    expect(flags).toEqual(
      expect.arrayContaining([
        "--preset",
        "--yes",
        "--force",
        "--merge",
        "--dry-run",
        "--name",
        "--author",
      ]),
    )
  })

  it("rejeita --force e --merge juntos", () => {
    const program = buildProgram()
    program.exitOverride()
    const init = program.commands.find((c) => c.name() === "init")
    if (!init) throw new Error("init command not registered")
    init.exitOverride()
    expect(() => program.parse(["init", "--force", "--merge"], { from: "user" })).toThrow()
  })
})
