import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { runAddAdr } from '../src/commands/add'

const tmp = () => mkdtempSync(join(tmpdir(), 'docseed-adr-'))
const templatesRoot = fileURLToPath(new URL('../templates', import.meta.url))

describe('runAddAdr', () => {
  it('creates 0001 and a fresh index when docs/adr is empty', () => {
    const cwd = tmp()
    const result = runAddAdr('Escolher banco de dados', cwd, templatesRoot)

    expect(result.number).toBe('0001')
    expect(result.slug).toBe('escolher-banco-de-dados')
    expect(result.path).toBe('docs/adr/0001-escolher-banco-de-dados.md')
    expect(result.indexCreated).toBe(true)

    const adr = readFileSync(join(cwd, result.path), 'utf8')
    expect(adr).toContain('# ADR 0001: Escolher banco de dados')
    expect(adr).toContain('**Status:** Proposed')

    const index = readFileSync(join(cwd, result.indexPath), 'utf8')
    expect(index).toContain(
      '| [0001](0001-escolher-banco-de-dados.md) | Escolher banco de dados | Proposed |',
    )
  })

  it('computes the next number and appends to an existing index', () => {
    const cwd = tmp()
    const adrDir = join(cwd, 'docs', 'adr')
    mkdirSync(adrDir, { recursive: true })
    writeFileSync(join(adrDir, '0001-foo.md'), '# ADR 0001: Foo\n')
    writeFileSync(join(adrDir, '0002-bar.md'), '# ADR 0002: Bar\n')
    writeFileSync(
      join(adrDir, 'README.md'),
      '# ADR\n\n| ADR | Decisão | Status |\n| --- | --- | --- |\n| [0001](0001-foo.md) | Foo | Accepted |\n| [0002](0002-bar.md) | Bar | Accepted |\n\n**Status possíveis:** Proposed, Accepted.\n',
    )

    const result = runAddAdr('Terceira decisão', cwd, templatesRoot)

    expect(result.number).toBe('0003')
    expect(result.indexCreated).toBe(false)

    const index = readFileSync(join(cwd, result.indexPath), 'utf8')
    expect(index).toContain('| [0002](0002-bar.md) | Bar | Accepted |')
    expect(index).toContain('| [0003](0003-terceira-decisao.md) | Terceira decisão | Proposed |')
    expect(index).toContain('**Status possíveis:**')
    // a nova linha entra logo após a última linha de tabela, antes do rodapé
    expect(index.indexOf('0003-terceira-decisao')).toBeLessThan(index.indexOf('Status possíveis'))
  })

  it('counts existing ADR files case-insensitively when picking the next number', () => {
    const cwd = tmp()
    const adrDir = join(cwd, 'docs', 'adr')
    mkdirSync(adrDir, { recursive: true })
    writeFileSync(join(adrDir, '0003-foo.MD'), '# ADR 0003: Foo\n')

    const result = runAddAdr('Quarta decisão', cwd, templatesRoot)

    expect(result.number).toBe('0004')
  })

  it('is not fooled by a horizontal rule before the table', () => {
    const cwd = tmp()
    const adrDir = join(cwd, 'docs', 'adr')
    mkdirSync(adrDir, { recursive: true })
    writeFileSync(join(adrDir, '0001-foo.md'), '# ADR 0001: Foo\n')
    writeFileSync(
      join(adrDir, 'README.md'),
      [
        '# ADR',
        '',
        '---',
        '',
        '| ADR | Decisão | Status |',
        '| --- | --- | --- |',
        '| [0001](0001-foo.md) | Foo | Accepted |',
        '',
        '**Status possíveis:** Proposed, Accepted.',
        '',
      ].join('\n'),
    )

    const result = runAddAdr('Segunda decisão', cwd, templatesRoot)
    const index = readFileSync(join(cwd, result.indexPath), 'utf8')

    // the new row lands inside the table, right after the last table row
    expect(index).toContain(
      '| [0001](0001-foo.md) | Foo | Accepted |\n| [0002](0002-segunda-decisao.md) | Segunda decisão | Proposed |',
    )
    expect(index.indexOf('0002-segunda-decisao')).toBeLessThan(index.indexOf('Status possíveis'))
  })

  it('rejects a title that produces an empty slug', () => {
    const cwd = tmp()
    expect(() => runAddAdr('!!!', cwd, templatesRoot)).toThrow(/empty slug/)
  })

  it('refuses to overwrite an already-existing ADR file', () => {
    const cwd = tmp()
    const adrDir = join(cwd, 'docs', 'adr')
    mkdirSync(adrDir, { recursive: true })
    // 9999-z.md is counted (next = 10000), while the 5-digit prefix of the
    // pre-existing destination is not, so nextNumber lands right on it.
    writeFileSync(join(adrDir, '9999-z.md'), '# ADR 9999: Z\n')
    writeFileSync(join(adrDir, '10000-escolher-banco-de-dados.md'), '# pre-existing\n')

    expect(() => runAddAdr('Escolher banco de dados', cwd, templatesRoot)).toThrow(
      /ADR file already exists: docs\/adr\/10000-escolher-banco-de-dados\.md/,
    )
  })

  it('inserts the new row inside the main table even with later | content', () => {
    const cwd = tmp()
    const adrDir = join(cwd, 'docs', 'adr')
    mkdirSync(adrDir, { recursive: true })
    writeFileSync(join(adrDir, '0001-foo.md'), '# ADR 0001: Foo\n')
    writeFileSync(
      join(adrDir, 'README.md'),
      [
        '# ADR',
        '',
        '| ADR | Decisão | Status |',
        '| --- | --- | --- |',
        '| [0001](0001-foo.md) | Foo | Accepted |',
        '',
        '**Status possíveis:** Proposed, Accepted.',
        '',
        '## Outra tabela',
        '',
        '| A | B |',
        '| --- | --- |',
        '| x | y |',
        '',
      ].join('\n'),
    )

    const result = runAddAdr('Segunda decisão', cwd, templatesRoot)
    const index = readFileSync(join(cwd, result.indexPath), 'utf8')

    // new row sits right after the main table's last row, before the footer
    expect(index).toContain(
      '| [0001](0001-foo.md) | Foo | Accepted |\n| [0002](0002-segunda-decisao.md) | Segunda decisão | Proposed |',
    )
    expect(index.indexOf('0002-segunda-decisao')).toBeLessThan(index.indexOf('Status possíveis'))
    // the unrelated second table stays untouched
    expect(index.indexOf('0002-segunda-decisao')).toBeLessThan(index.indexOf('| x | y |'))
  })
})
