import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const binary = join(repoRoot, 'dist', 'index.mjs')

describe('docseed add adr (real binary)', () => {
  beforeAll(() => {
    execSync('pnpm -s build', { cwd: repoRoot, stdio: 'ignore' })
  }, 120000)

  it('creates the first ADR and the index, then increments on a second call', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'docseed-add-adr-e2e-'))

    execSync(`node ${binary} add adr "Escolher banco de dados"`, { cwd, stdio: 'ignore' })

    const firstAdr = join(cwd, 'docs', 'adr', '0001-escolher-banco-de-dados.md')
    const index = join(cwd, 'docs', 'adr', 'README.md')
    expect(existsSync(firstAdr)).toBe(true)
    expect(existsSync(index)).toBe(true)

    const adrBody = readFileSync(firstAdr, 'utf8')
    expect(adrBody).toContain('# ADR 0001: Escolher banco de dados')
    expect(adrBody).not.toContain('{{')

    const indexAfterFirst = readFileSync(index, 'utf8')
    expect(indexAfterFirst).toContain(
      '| [0001](0001-escolher-banco-de-dados.md) | Escolher banco de dados | Proposed |',
    )

    // second call increments the number and updates the same index
    execSync(`node ${binary} add adr "Usar fila de mensagens"`, { cwd, stdio: 'ignore' })

    const secondAdr = join(cwd, 'docs', 'adr', '0002-usar-fila-de-mensagens.md')
    expect(existsSync(secondAdr)).toBe(true)

    const indexAfterSecond = readFileSync(index, 'utf8')
    expect(indexAfterSecond).toContain(
      '| [0001](0001-escolher-banco-de-dados.md) | Escolher banco de dados | Proposed |',
    )
    expect(indexAfterSecond).toContain(
      '| [0002](0002-usar-fila-de-mensagens.md) | Usar fila de mensagens | Proposed |',
    )
  }, 60000)
})
